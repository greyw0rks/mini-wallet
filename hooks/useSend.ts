"use client";

import { useState } from "react";
import { useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits, erc20Abi, encodeFunctionData } from "viem";
import type { Token } from "@/lib/tokens";

// Stablecoins supported as fee currencies on Celo, in priority order
export const FEE_CURRENCIES = [
  { symbol: "USDm",  address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}` },
  { symbol: "USDC",  address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}` },
  { symbol: "USDT",  address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}` },
];

/**
 * Pick the best fee currency for a transaction.
 *
 * Rules:
 * 1. If sending a stablecoin that supports feeCurrency → use that token itself
 * 2. Otherwise → find the first stablecoin the user holds
 * 3. If no stablecoins → undefined (falls back to CELO gas)
 */
export function selectFeeCurrency(
  token: Token,
  balances: Record<string, bigint | undefined>
): { symbol: string; address: `0x${string}` } | undefined {
  // Sending a stablecoin → pay gas in that stablecoin
  const sameToken = FEE_CURRENCIES.find(
    (f) => f.symbol === token.symbol || f.address === token.address
  );
  if (sameToken) return sameToken;

  // Otherwise find any stablecoin the user holds with a non-zero balance
  for (const fc of FEE_CURRENCIES) {
    const bal = balances[fc.symbol];
    if (bal !== undefined && bal > 0n) return fc;
  }

  return undefined; // No stablecoins — use CELO for gas
}

function isMiniPayWallet() {
  return typeof window !== "undefined" && !!window.ethereum?.isMiniPay;
}

// MiniPay: bare minimum params only — to, value, data, feeCurrency
// No from, no type, no maxFeePerGas
async function miniPaySend(params: {
  to: string;
  value?: string;
  data?: string;
  feeCurrency?: string;
}): Promise<`0x${string}`> {
  const tx: Record<string, string> = { to: params.to };
  if (params.value)       tx.value       = params.value;
  if (params.data)        tx.data        = params.data;
  if (params.feeCurrency) tx.feeCurrency = params.feeCurrency;

  const hash = await window.ethereum!.request({
    method: "eth_sendTransaction",
    params: [tx],
  });
  return hash as `0x${string}`;
}

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
    balances = {},
  }: {
    token: Token;
    to: `0x${string}`;
    amount: string;
    balances?: Record<string, bigint | undefined>;
  }) {
    setStatus({ type: "pending" });

    try {
      let hash: `0x${string}`;
      const miniPay   = isMiniPayWallet();
      const feeCurr   = selectFeeCurrency(token, balances);
      const feeAddr   = feeCurr?.address;

      if (token.native) {
        const value    = parseEther(amount);
        const valueHex = `0x${value.toString(16)}` as const;

        if (miniPay) {
          hash = await miniPaySend({ to, value: valueHex, feeCurrency: feeAddr });
        } else {
          hash = await sendTransactionAsync({
            to,
            value,
            ...(feeAddr ? { feeCurrency: feeAddr } : {}),
          } as any);
        }
      } else {
        const rawAmount = parseUnits(amount, token.decimals);
        const data      = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to, rawAmount],
        });

        if (miniPay) {
          hash = await miniPaySend({ to: token.address!, data, feeCurrency: feeAddr });
        } else {
          hash = await writeContractAsync({
            address: token.address!,
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, rawAmount],
            ...(feeAddr ? { feeCurrency: feeAddr } : {}),
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
