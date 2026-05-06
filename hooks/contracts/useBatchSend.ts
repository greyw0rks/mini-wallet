"use client";

import { useState } from "react";
import { useWriteContract, useSendTransaction } from "wagmi";
import { parseUnits, parseEther, erc20Abi, maxUint256 } from "viem";
import { useReadContract } from "wagmi";
import { BATCH_SENDER_ADDRESS, BATCH_SENDER_ABI } from "@/lib/contracts";
import type { Token } from "@/lib/tokens";

export type Recipient = {
  address: string;
  amount: string;
};

export type BatchStatus =
  | { type: "idle" }
  | { type: "approving" }
  | { type: "pending" }
  | { type: "success"; hash: `0x${string}` }
  | { type: "error"; message: string };

export function useBatchSend() {
  const [status, setStatus] = useState<BatchStatus>({ type: "idle" });

  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const isMiniPay =
    typeof window !== "undefined" && !!window.ethereum?.isMiniPay;

  const legacyFlag = isMiniPay ? { type: "legacy" as const } : {};

  async function batchSend({
    token,
    recipients,
    equalSplit,
  }: {
    token: Token;
    recipients: Recipient[];
    equalSplit: boolean;
  }) {
    if (!BATCH_SENDER_ADDRESS) {
      setStatus({ type: "error", message: "Contract not deployed yet." });
      return;
    }

    setStatus({ type: "pending" });

    try {
      const addresses = recipients.map((r) => r.address as `0x${string}`);
      let hash: `0x${string}`;

      if (token.native) {
        // ── Native CELO ──────────────────────────────────────────────────────
        if (equalSplit) {
          const amountEach = parseEther(recipients[0].amount);
          const total = amountEach * BigInt(recipients.length);

          hash = await writeContractAsync({
            address: BATCH_SENDER_ADDRESS,
            abi: BATCH_SENDER_ABI,
            functionName: "batchSendNativeEqual",
            args: [addresses, amountEach],
            value: total,
            ...legacyFlag,
          });
        } else {
          const amounts = recipients.map((r) => parseEther(r.amount));
          const total = amounts.reduce((a, b) => a + b, 0n);

          hash = await writeContractAsync({
            address: BATCH_SENDER_ADDRESS,
            abi: BATCH_SENDER_ABI,
            functionName: "batchSendNative",
            args: [addresses, amounts],
            value: total,
            ...legacyFlag,
          });
        }
      } else {
        // ── ERC-20 ───────────────────────────────────────────────────────────
        // Step 1: Approve BatchSender to spend tokens
        setStatus({ type: "approving" });

        await writeContractAsync({
          address: token.address!,
          abi: erc20Abi,
          functionName: "approve",
          args: [BATCH_SENDER_ADDRESS, maxUint256],
          ...legacyFlag,
        });

        setStatus({ type: "pending" });

        if (equalSplit) {
          const amountEach = parseUnits(recipients[0].amount, token.decimals);

          hash = await writeContractAsync({
            address: BATCH_SENDER_ADDRESS,
            abi: BATCH_SENDER_ABI,
            functionName: "batchSendERC20Equal",
            args: [token.address!, addresses, amountEach],
            ...legacyFlag,
          });
        } else {
          const amounts = recipients.map((r) =>
            parseUnits(r.amount, token.decimals)
          );

          hash = await writeContractAsync({
            address: BATCH_SENDER_ADDRESS,
            abi: BATCH_SENDER_ABI,
            functionName: "batchSendERC20",
            args: [token.address!, addresses, amounts],
            ...legacyFlag,
          });
        }
      }

      setStatus({ type: "success", hash });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message.slice(0, 120) : "Batch send failed.";
      setStatus({ type: "error", message });
    }
  }

  function reset() {
    setStatus({ type: "idle" });
  }

  return { batchSend, status, reset };
}
