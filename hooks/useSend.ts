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

/** Extract a human-readable message from any error shape MiniPay/wagmi throws */
function extractError(err: unknown): string {
  if (!err) return "Transaction failed.";

  // MiniPay throws plain objects: { code: 4001, message: "..." }
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;

    // User rejected
    if (e.code === 4001 || e.code === "ACTION_REJECTED") return "Transaction rejected.";

    // Has a message string
    if (typeof e.message === "string" && e.message.length > 0) {
      const msg = e.message;
      if (msg.includes("user rejected") || msg.includes("User denied")) return "Transaction rejected.";
      if (msg.includes("insufficient funds")) return "Insufficient funds for gas.";
      if (msg.includes("nonce")) return "Nonce error — try again.";
      return msg.slice(0, 100);
    }

    // Nested error data
    if (typeof e.data === "object" && e.data !== null) {
      const d = e.data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message.slice(0, 100);
    }

    // Last resort — stringify but catch circular refs
    try {
      const str = JSON.stringify(err);
      if (str !== "{}") return str.slice(0, 100);
    } catch {}
  }

  if (typeof err === "string") return err.slice(0, 100);
  if (err instanceof Error)    return err.message.slice(0, 100);

  return "Transaction failed. Check your balance and try again.";
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
      const miniPay = isMiniPay();
      const feeCurr = selectFeeCurrency(token, balances);

      if (miniPay) {
        // MiniPay: bare minimum only — to + value or data
        // MiniPay handles gas in cUSD automatically
        if (token.native) {
          const value = parseEther(amount);
          hash = await window.ethereum!.request({
            method: "eth_sendTransaction",
            params: [{ to, value: `0x${value.toString(16)}` }],
          }) as `0x${string}`;
        } else {
          const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, parseUnits(amount, token.decimals)],
          });
          hash = await window.ethereum!.request({
            method: "eth_sendTransaction",
            params: [{ to: token.address!, data }],
          }) as `0x${string}`;
        }
      } else {
        // MetaMask / Rabby on Celo — use feeCurrency for gas abstraction
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
      setStatus({ type: "error", message: extractError(err) });
    }
  }

  function reset() { setStatus({ type: "idle" }); }

  return { send, status, reset };
}
