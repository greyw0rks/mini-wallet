"use client";

import { useBalance, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { celo } from "wagmi/chains";
import { TOKENS, type Token } from "@/lib/tokens";

type BalanceMap = Record<string, bigint | undefined>;

export function useBalances(address: `0x${string}` | undefined): {
  balances: BalanceMap;
  isLoading: boolean;
  refetch: () => void;
} {
  // Native CELO balance
  const {
    data: nativeData,
    isLoading: nativeLoading,
    refetch: refetchNative,
  } = useBalance({
    address,
    chainId: celo.id,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  // ERC-20 tokens
  const erc20Tokens = TOKENS.filter((t): t is Token & { address: `0x${string}` } => !t.native);

  const contracts = erc20Tokens.map((token) => ({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: [address ?? "0x0000000000000000000000000000000000000000"] as const,
    chainId: celo.id,
  }));

  const {
    data: erc20Data,
    isLoading: erc20Loading,
    refetch: refetchErc20,
  } = useReadContracts({
    contracts,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const balances: BalanceMap = {
    CELO: nativeData?.value,
  };

  erc20Tokens.forEach((token, i) => {
    const result = erc20Data?.[i];
    balances[token.symbol] =
      result?.status === "success" ? (result.result as bigint) : undefined;
  });

  const refetch = () => {
    refetchNative();
    refetchErc20();
  };

  return {
    balances,
    isLoading: nativeLoading || erc20Loading,
    refetch,
  };
}
