"use client";

import { useState } from "react";
import { useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits, erc20Abi, encodeFunctionData } from "viem";
import type { Token } from "@/lib/tokens";

// cUSD — used as feeCurrency on non-MiniPay Celo wallets
const CUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`;

export type SendStatus =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "success"; hash: `0x${string}` }
  | { type: "error"; message: string };

function isMiniPayWallet() {
  return typeof window !== "undefined" && !!window.ethereum?.isMiniPay;
}

// MiniPay requires bare-minimum params — no from, no type, no feeCurrency.
// It handles gas and fee currency internally.
async function miniPaySend(params: {
  to: string;
  value?: string;    // hex
  data?: string;     // hex
}): Promise<`0x${string}`> {
  const tx: Record<string, string> = { to: params.to };
  if (params.value) tx.value = params.value;
  if (params.data)  tx.data  = params.data;

  const hash = await window.ethereum!.request({
    method: "eth_sendTransaction",
    params: [tx],
  });
  return hash as `0x${string}`;
}

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
      const miniPay = isMiniPayWallet();

      if (token.native) {
        const value = parseEther(amount);
        const valueHex = `0x${value.toString(16)}` as const;

        if (miniPay) {
          // MiniPay: send bare tx, no from/type/feeCurrency
          hash = await miniPaySend({ to, value: valueHex });
        } else {
          // Other Celo wallets: use feeCurrency so gas is paid in cUSD
          hash = await sendTransactionAsync({
            to,
            value,
            feeCurrency: CUSD,
          } as any);
        }
      } else {
        // ERC-20 transfer
        const rawAmount = parseUnits(amount, token.decimals);
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to, rawAmount],
        });

        if (miniPay) {
          // MiniPay: call contract with bare data, no from/type/feeCurrency
          hash = await miniPaySend({ to: token.address!, data });
        } else {
          hash = await writeContractAsync({
            address: token.address!,
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, rawAmount],
            feeCurrency: CUSD,
          } as any);
        }
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
