"use client";

import { useState } from "react";
import { useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits, erc20Abi, encodeFunctionData } from "viem";
import type { Token } from "@/lib/tokens";

export const FEE_CURRENCIES = [
  { symbol: "USDm", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}` },
  { symbol: "USDC", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}` },
  { symbol: "USDT", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}` },
];

export function selectFeeCurrency(
  token: Token,
  balances: Record<string, bigint | undefined>
): { symbol: string; address: `0x${string}` } | undefined {
  const sameToken = FEE_CURRENCIES.find(
    (f) => f.symbol === token.symbol || f.address === token.address
  );
  if (sameToken) return sameToken;

  for (const fc of FEE_CURRENCIES) {
    const bal = balances[fc.symbol];
    if (bal !== undefined && bal > 0n) return fc;
  }
  return undefined;
}

function isMiniPay() {
  return typeof window !== "undefined" && !!window.ethereum?.isMiniPay;
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
      const miniPay  = isMiniPay();
      const feeCurr  = selectFeeCurrency(token, balances);

      if (miniPay) {
        // ── MiniPay path ──────────────────────────────────────────────────
        // Only to + value/data. MiniPay handles gas internally using cUSD.
        // Do NOT pass: from, type, feeCurrency, gasPrice, maxFeePerGas
        if (token.native) {
          const value = parseEther(amount);
          hash = await window.ethereum!.request({
            method: "eth_sendTransaction",
            params: [{
              to,
              value: `0x${value.toString(16)}`,
            }],
          }) as `0x${string}`;
        } else {
          const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, parseUnits(amount, token.decimals)],
          });
          hash = await window.ethereum!.request({
            method: "eth_sendTransaction",
            params: [{
              to: token.address!,
              data,
            }],
          }) as `0x${string}`;
        }
      } else {
        // ── Non-MiniPay path (MetaMask, Rabby on Celo) ───────────────────
        // Use feeCurrency so gas is paid in stablecoins
        const feeExt = feeCurr ? { feeCurrency: feeCurr.address } : {};

        if (token.native) {
          hash = await sendTransactionAsync({
            to,
            value: parseEther(amount),
            ...feeExt,
          } as any);
        } else {
          hash = await writeContractAsync({
            address: token.address!,
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, parseUnits(amount, token.decimals)],
            ...feeExt,
          } as any);
        }
      }

      setStatus({ type: "success", hash });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      // Surface a clean message
      const message = raw.includes("user rejected")
        ? "Transaction rejected."
        : raw.slice(0, 120);
      setStatus({ type: "error", message });
    }
  }

  function reset() { setStatus({ type: "idle" }); }

  return { send, status, reset };
}
