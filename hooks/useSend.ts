"use client";

import { useState } from "react";
import { useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits, erc20Abi } from "viem";
import type { Token } from "@/lib/tokens";

// cUSD address on Celo mainnet — used as fee currency
// This means gas is paid in cUSD, not CELO
const CUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`;

export type SendStatus =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "success"; hash: `0x${string}` }
  | { type: "error"; message: string };

export function useSend() {
  const [status, setStatus] = useState<SendStatus>({ type: "idle" });

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync }   = useWriteContract();

  async function send({
    token,
    to,
    amount,
  }: {
    token: Token;
    to: `0x${string}`;
    amount: string;
  }) {
    setStatus({ type: "pending" });

    try {
      let hash: `0x${string}`;

      // feeCurrency tells Celo to pay gas in cUSD instead of CELO.
      // This is a Celo-specific EIP-1559 extension (CIP-64).
      // Supported natively by MiniPay, MetaMask Celo, and Rabby on Celo.
      const celoTxExtras = {
        feeCurrency: CUSD,
      } as const;

      if (token.native) {
        hash = await sendTransactionAsync({
          to,
          value: parseEther(amount),
          ...celoTxExtras,
        });
      } else {
        hash = await writeContractAsync({
          address: token.address!,
          abi: erc20Abi,
          functionName: "transfer",
          args: [to, parseUnits(amount, token.decimals)],
          ...celoTxExtras,
        });
      }

      setStatus({ type: "success", hash });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message.slice(0, 120) : "Transaction failed.";
      setStatus({ type: "error", message });
    }
  }

  function reset() {
    setStatus({ type: "idle" });
  }

  return { send, status, reset };
}
