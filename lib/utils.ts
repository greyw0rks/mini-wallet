import { formatUnits } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenBalance(
  raw: bigint | undefined,
  decimals: number,
  precision = 4
): string {
  if (raw === undefined || raw === null) return "—";
  const formatted = formatUnits(raw, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmed = fraction.slice(0, precision).replace(/0+$/, "");
  return trimmed ? `${Number(whole).toLocaleString()}.${trimmed}` : Number(whole).toLocaleString();
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
