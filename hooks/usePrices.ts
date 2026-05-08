"use client";

/**
 * Live token prices via CoinGecko public API.
 *
 * HOW IT WORKS:
 * - Fetches USD prices from CoinGecko's /simple/price endpoint
 * - Polls every 30 seconds (CoinGecko free tier allows ~30 req/min)
 * - No API key required for public endpoints
 *
 * LIMITATIONS OF FREE TIER:
 * - ~30s delay behind real market price (not tick-by-tick)
 * - Rate limited — do not reduce the 30s interval
 *
 * FOR TRUE REAL-TIME (future upgrade options):
 * - CoinGecko Pro API ($129/mo) → websocket feed
 * - Chainlink price feeds on Celo → on-chain oracle, always fresh
 *   e.g. CELO/USD: 0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e
 * - Ubeswap TWAP oracles → on-chain, free, ~5min average
 */

import { useState, useEffect, useCallback } from "react";
import { TOKENS } from "@/lib/tokens";

export type PriceMap = Record<string, number | undefined>;

const IDS = TOKENS.filter((t) => t.coingeckoId).map((t) => t.coingeckoId).join(",");
const PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd&include_24hr_change=true`;

const ID_TO_SYMBOL: Record<string, string> = {};
TOKENS.forEach((t) => { if (t.coingeckoId) ID_TO_SYMBOL[t.coingeckoId] = t.symbol; });

export type PriceData = {
  usd: number;
  usd_24h_change?: number;
};

export function usePrices() {
  const [prices, setPrices]       = useState<PriceMap>({});
  const [changes, setChanges]     = useState<Record<string, number | undefined>>({});
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError]         = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res  = await fetch(PRICE_URL);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      const nextPrices: PriceMap = {};
      const nextChanges: Record<string, number | undefined> = {};

      for (const [id, val] of Object.entries(data)) {
        const symbol = ID_TO_SYMBOL[id];
        if (!symbol) continue;
        const v = val as PriceData;
        nextPrices[symbol]  = v.usd;
        nextChanges[symbol] = v.usd_24h_change;
      }

      setPrices(nextPrices);
      setChanges(nextChanges);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // 30s — fastest safe interval for CoinGecko free tier
    const interval = setInterval(fetchPrices, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = (symbol: string) => prices[symbol];

  const formatPrice = (symbol: string): string => {
    const price = prices[symbol];
    if (!price) return "";
    if (price >= 1000)  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1)     return `$${price.toFixed(2)}`;
    if (price >= 0.01)  return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const get24hChange = (symbol: string): number | undefined => changes[symbol];

  return {
    prices,
    loading,
    error,
    lastUpdated,
    getPrice,
    formatPrice,
    get24hChange,
    refetch: fetchPrices,
  };
}
