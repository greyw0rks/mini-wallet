"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";

const CELOSCAN = "https://api.celoscan.io/api";
// Free tier works without a key but is rate-limited.
// Get a free key at https://celoscan.io/myapikey and set NEXT_PUBLIC_CELOSCAN_KEY
const API_KEY = process.env.NEXT_PUBLIC_CELOSCAN_KEY ?? "YourApiKeyToken";

export type ActivityItem = {
  hash: string;
  type: "send" | "receive" | "contract" | "token_send" | "token_receive";
  token: string;
  amount: string;
  from: string;
  to: string;
  timestamp: number;         // unix seconds
  status: "ok" | "failed";
  isTokenTx: boolean;
};

async function fetchNativeTxs(address: string): Promise<ActivityItem[]> {
  const url = `${CELOSCAN}?module=account&action=txlist&address=${address}&page=1&offset=20&sort=desc&apikey=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  if (json.status !== "1" || !Array.isArray(json.result)) return [];

  return json.result.map((tx: any): ActivityItem => {
    const isSend   = tx.from.toLowerCase() === address.toLowerCase();
    const isContract = tx.to === "" || (tx.input && tx.input !== "0x");
    const amount   = Number(formatUnits(BigInt(tx.value), 18));

    return {
      hash:       tx.hash,
      type:       isContract ? "contract" : isSend ? "send" : "receive",
      token:      "CELO",
      amount:     amount === 0 ? "" : amount.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      from:       tx.from,
      to:         tx.to,
      timestamp:  Number(tx.timeStamp),
      status:     tx.isError === "0" ? "ok" : "failed",
      isTokenTx:  false,
    };
  });
}

async function fetchTokenTxs(address: string): Promise<ActivityItem[]> {
  const url = `${CELOSCAN}?module=account&action=tokentx&address=${address}&page=1&offset=20&sort=desc&apikey=${API_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  if (json.status !== "1" || !Array.isArray(json.result)) return [];

  return json.result.map((tx: any): ActivityItem => {
    const isSend = tx.from.toLowerCase() === address.toLowerCase();
    const amount = Number(formatUnits(BigInt(tx.value), Number(tx.tokenDecimal)));

    return {
      hash:       tx.hash,
      type:       isSend ? "token_send" : "token_receive",
      token:      tx.tokenSymbol,
      amount:     amount.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      from:       tx.from,
      to:         tx.to,
      timestamp:  Number(tx.timeStamp),
      status:     "ok",
      isTokenTx:  true,
    };
  });
}

export function useActivity(address: `0x${string}` | undefined) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);

  const fetchActivity = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(false);
    try {
      const [native, tokens] = await Promise.all([
        fetchNativeTxs(address),
        fetchTokenTxs(address),
      ]);

      // Merge, deduplicate by hash+token, sort by time desc, take top 10
      const seen = new Set<string>();
      const merged = [...native, ...tokens]
        .filter((tx) => {
          const key = `${tx.hash}-${tx.token}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setActivity(merged);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, error, refetch: fetchActivity };
}
