"use client";

import { useState } from "react";
import {
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, parseUnits, erc20Abi } from "viem";
import type { Token } from "@/lib/tokens";

export type SendStatus =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "success"; hash: `0x${string}` }
  | { type: "error"; message: string };

export function useSend() {
  const [status, setStatus] = useState<SendStatus>({ type: "idle" });
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  const isMiniPay =
    typeof window !== "undefined" && !!window.ethereum?.isMiniPay;

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

     if (token.native) {
  hash = await sendTransactionAsync({
    to,
    value: parseEther(amount),
    ...(isMiniPay ? { type: "legacy" as const, gasPrice: undefined } : {}),
  });
} else {
  hash = await writeContractAsync({
    address: token.address!,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, parseUnits(amount, token.decimals)],
    ...(isMiniPay ? { type: "legacy" as const, gasPrice: undefined } : {}),
  });
}

      setTxHash(hash);
      setStatus({ type: "success", hash });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message.slice(0, 100) : "Transaction failed.";
      setStatus({ type: "error", message });
    }
  }

  function reset() {
    setStatus({ type: "idle" });
    setTxHash(undefined);
  }

  return { send, status, reset };
}
