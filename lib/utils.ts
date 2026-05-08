import { formatUnits } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Smart token amount formatter.
 * - Stablecoins ($1): 2 decimals
 * - Mid-value ($1–$100): 4 decimals
 * - High-value ($100+, BTC/ETH): up to 8 decimals, never shows 0
 */
export function formatTokenBalance(
  raw: bigint | undefined,
  decimals: number,
  tokenPrice?: number
): string {
  if (raw === undefined || raw === null) return "—";
  if (raw === 0n) return "0";

  const amount = Number(formatUnits(raw, decimals));

  // Never show 0 for non-zero balance — use adaptive precision
  if (tokenPrice && tokenPrice > 0) {
    const usdValue = amount * tokenPrice;

    if (tokenPrice >= 1000) {
      // BTC, ETH — show enough decimals to represent real value
      // e.g. 0.000015 BTC = ~$1.50 should show as 0.000015
      const precision = Math.max(2, Math.ceil(-Math.log10(amount)) + 2);
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.min(precision, 10),
      });
    }

    if (tokenPrice >= 1) {
      // CELO, mid-value tokens
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
    }
  }

  // Stablecoins or unknown price — 4 decimal places max
  if (amount >= 1) {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  }

  // Very small amounts — show enough significant digits
  const precision = Math.max(4, Math.ceil(-Math.log10(amount)) + 2);
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(precision, 10),
  });
}

export function formatUsdValue(
  raw: bigint | undefined,
  decimals: number,
  price: number | undefined
): string {
  if (raw === undefined || !price) return "";
  const amount = Number(formatUnits(raw, decimals));
  const value = amount * price;
  if (value === 0) return "";
  if (value < 0.01) return `< $0.01`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export function celoscanTx(hash: string) {
  return `https://celoscan.io/tx/${hash}`;
}

export function celoscanAddress(address: string) {
  return `https://celoscan.io/address/${address}`;
}
