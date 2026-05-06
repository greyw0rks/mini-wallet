"use client";
import { RefreshCw, TrendingUp } from "lucide-react";
import { TOKENS, type Token } from "@/lib/tokens";
import { formatTokenBalance } from "@/lib/utils";
import { TokenLogo } from "@/components/TokenLogo";
import type { PriceMap } from "@/hooks/usePrices";

interface TokenListProps {
  balances: Record<string, bigint | undefined>;
  isLoading: boolean;
  onRefresh: () => void;
  onSend: (token: Token) => void;
  prices: PriceMap;
  getUsdValue: (symbol: string, balance: bigint | undefined, decimals: number) => string;
  formatPrice: (symbol: string) => string;
  pricesLoading: boolean;
}

export function TokenList({ balances, isLoading, onRefresh, onSend, prices, getUsdValue, formatPrice, pricesLoading }: TokenListProps) {
  const totalUsd = TOKENS.reduce((sum, t) => {
    const price = prices[t.symbol];
    const bal   = balances[t.symbol];
    if (!price || bal === undefined) return sum;
    return sum + (Number(bal) / 10 ** t.decimals) * price;
  }, 0);

  return (
    <div>
      <div className="bg-surface border border-border1 rounded-2xl px-5 py-4 mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-muted tracking-widest uppercase mb-1">Portfolio Value</div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {pricesLoading && totalUsd === 0
              ? <span className="skeleton h-7 w-32 block" />
              : `$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-accent text-xs font-semibold"><TrendingUp size={13} />Live</div>
      </div>

      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] font-semibold text-muted tracking-widest uppercase">Tokens</span>
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-[11px] text-muted hover:text-white transition-colors py-1">
          <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Updating…" : "Refresh"}
        </button>
      </div>

      <div className="bg-surface border border-border1 rounded-2xl overflow-hidden">
        {TOKENS.map((token, idx) => {
          const balance  = balances[token.symbol];
          const usdValue = getUsdValue(token.symbol, balance, token.decimals);
          const price    = formatPrice(token.symbol);
          const isLast   = idx === TOKENS.length - 1;
          return (
            <div key={token.symbol} onClick={() => onSend(token)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface2 transition-colors group ${!isLast ? "border-b border-border1" : ""}`}>
              <div className="flex items-center gap-3">
                <TokenLogo token={token} size={38} />
                <div>
                  <div className="text-sm font-semibold text-white">{token.symbol}</div>
                  <div className="text-[11px] text-muted mt-0.5">{price || token.name}</div>
                </div>
              </div>
              <div className="text-right">
                {isLoading && balance === undefined ? (
                  <><div className="skeleton h-3.5 w-20 mb-1.5 ml-auto" /><div className="skeleton h-2.5 w-14 ml-auto" /></>
                ) : (
                  <>
                    <div className="font-mono text-sm font-medium text-white">{formatTokenBalance(balance, token.decimals)}</div>
                    <div className="text-[11px] text-muted mt-0.5 group-hover:text-accent transition-colors">{usdValue || "Tap to send →"}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted text-center mt-2">Prices via CoinGecko · Updates every 60s</p>
    </div>
  );
}
