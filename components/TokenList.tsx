"use client";

import { TOKENS, type Token } from "@/lib/tokens";
import { formatTokenBalance, formatUsdValue } from "@/lib/utils";
import { TokenLogo } from "@/components/TokenLogo";
import { ChevronRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { PriceMap } from "@/hooks/usePrices";

interface TokenListProps {
  balances: Record<string, bigint | undefined>;
  isLoading: boolean;
  onSend: (token: Token) => void;
  prices: PriceMap;
  formatPrice: (symbol: string) => string;
  getPrice: (symbol: string) => number | undefined;
  get24hChange: (symbol: string) => number | undefined;
}

export function TokenList({
  balances,
  isLoading,
  onSend,
  prices,
  formatPrice,
  getPrice,
  get24hChange,
}: TokenListProps) {

  // Only show tokens the user actually holds
  const heldTokens = TOKENS.filter((t) => {
    const bal = balances[t.symbol];
    return bal !== undefined && bal > 0n;
  });

  // Skeleton rows while loading for the first time
  if (isLoading && Object.keys(balances).length === 0) {
    return (
      <div className="space-y-1 pb-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-20" />
              <div className="skeleton h-3 w-14" />
            </div>
            <div className="space-y-2 text-right">
              <div className="skeleton h-3.5 w-16 ml-auto" />
              <div className="skeleton h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (heldTokens.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-border1 flex items-center justify-center mb-4">
          <Wallet size={24} className="text-muted" />
        </div>
        <p className="text-sm font-semibold text-text mb-1">No tokens yet</p>
        <p className="text-xs text-muted leading-relaxed">
          Your CELO, USDT, WBTC and other tokens will appear here once you receive them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 pb-2">
      {heldTokens.map((token) => {
        const balance   = balances[token.symbol]!;
        const price     = getPrice(token.symbol);
        const usdValue  = formatUsdValue(balance, token.decimals, price);
        const change    = get24hChange(token.symbol);
        const isUp      = change !== undefined && change >= 0;

        return (
          <div key={token.symbol} onClick={() => onSend(token)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer
                       hover:bg-surface2 active:bg-surface3 transition-colors group">

            <TokenLogo token={token} size={42} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[15px] font-semibold text-text">{token.symbol}</span>
                {/* Balance — adaptive precision so 0.000015 BTC shows correctly */}
                <span className="font-mono text-[15px] font-semibold text-text">
                  {formatTokenBalance(balance, token.decimals, price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                {/* Price + 24h change */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-muted">{formatPrice(token.symbol)}</span>
                  {change !== undefined && (
                    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${isUp ? "text-accent" : "text-danger"}`}>
                      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(change).toFixed(2)}%
                    </span>
                  )}
                </div>
                {/* USD value */}
                <span className="text-[12px] text-muted">{usdValue}</span>
              </div>
            </div>

            <ChevronRight size={14} className="text-border2 group-hover:text-muted transition-colors flex-shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
