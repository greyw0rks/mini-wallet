"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { celo } from "wagmi/chains";
import { CONTACT_BOOK_ADDRESS, CONTACT_BOOK_ABI } from "@/lib/contracts";

export type Contact = {
  name: string;
  wallet: `0x${string}`;
  createdAt: number;
};

export function useContactBook(address: `0x${string}` | undefined) {
  const [isWriting, setIsWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const isMiniPay =
    typeof window !== "undefined" && !!window.ethereum?.isMiniPay;
  const legacyFlag = isMiniPay ? { type: "legacy" as const } : {};

  // ── Read contacts ──────────────────────────────────────────────────────────
  const {
    data: rawContacts,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTACT_BOOK_ADDRESS || undefined,
    abi: CONTACT_BOOK_ABI,
    functionName: "getContacts",
    chainId: celo.id,
    query: {
      enabled: !!address && !!CONTACT_BOOK_ADDRESS,
    },
  });

  const contacts: Contact[] = (rawContacts ?? []).map((c) => ({
    name: c.name,
    wallet: c.wallet,
    createdAt: Number(c.createdAt),
  }));

  // ── Write helpers ──────────────────────────────────────────────────────────

  async function addContact(name: string, wallet: `0x${string}`) {
    if (!CONTACT_BOOK_ADDRESS) return;
    setIsWriting(true);
    setWriteError(null);
    try {
      await writeContractAsync({
        address: CONTACT_BOOK_ADDRESS,
        abi: CONTACT_BOOK_ABI,
        functionName: "addContact",
        args: [name, wallet],
        ...legacyFlag,
      });
      await refetch();
    } catch (err: unknown) {
      setWriteError(err instanceof Error ? err.message.slice(0, 100) : "Failed.");
    } finally {
      setIsWriting(false);
    }
  }

  async function updateContact(
    index: number,
    name: string,
    wallet: `0x${string}`
  ) {
    if (!CONTACT_BOOK_ADDRESS) return;
    setIsWriting(true);
    setWriteError(null);
    try {
      await writeContractAsync({
        address: CONTACT_BOOK_ADDRESS,
        abi: CONTACT_BOOK_ABI,
        functionName: "updateContact",
        args: [BigInt(index), name, wallet],
        ...legacyFlag,
      });
      await refetch();
    } catch (err: unknown) {
      setWriteError(err instanceof Error ? err.message.slice(0, 100) : "Failed.");
    } finally {
      setIsWriting(false);
    }
  }

  async function removeContact(index: number) {
    if (!CONTACT_BOOK_ADDRESS) return;
    setIsWriting(true);
    setWriteError(null);
    try {
      await writeContractAsync({
        address: CONTACT_BOOK_ADDRESS,
        abi: CONTACT_BOOK_ABI,
        functionName: "removeContact",
        args: [BigInt(index)],
        ...legacyFlag,
      });
      await refetch();
    } catch (err: unknown) {
      setWriteError(err instanceof Error ? err.message.slice(0, 100) : "Failed.");
    } finally {
      setIsWriting(false);
    }
  }

  return {
    contacts,
    isLoading,
    isWriting,
    writeError,
    addContact,
    updateContact,
    removeContact,
    refetch,
    contractDeployed: !!CONTACT_BOOK_ADDRESS,
  };
}
