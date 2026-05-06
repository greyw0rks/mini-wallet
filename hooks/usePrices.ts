"use client";

import { useState, useEffect, useCallback } from "react";
import { TOKENS } from "@/lib/tokens";

export type PriceMap = Record<string, number | undefined>;

const IDS = TOKENS.map((t) => t.coingeckoId).join(",");
const URL = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd`;

const ID_TO_SYMBOL: Record<string, string> = {};
TOKENS.forEach((t) => { ID_TO_SYMBOL[t.coingeckoId] = t.symbol; });

export function usePrices() {
  const [prices, setPrices]   = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res  = await fetch(URL);
      const data = await res.json();
      const next: PriceMap = {};
      for (const [id, val] of Object.entries(data)) {
        const symbol = ID_TO_SYMBOL[id];
        if (symbol) next[symbol] = (val as { usd: number }).usd;
      }
      setPrices(next);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getUsdValue = (symbol: string, balance: bigint | undefined, decimals: number): string => {
    const price = prices[symbol];
    if (!price || balance === undefined) return "";
    const amount = Number(balance) / 10 ** decimals;
    const value  = amount * price;
    if (value < 0.01) return "< $0.01";
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (symbol: string): string => {
    const price = prices[symbol];
    if (!price) return "";
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1)    return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return { prices, loading, error, getUsdValue, formatPrice, refetch: fetchPrices };
}
