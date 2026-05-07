"use client";
import { TOKENS, type Token } from "@/lib/tokens";
import { formatTokenBalance } from "@/lib/utils";
import { TokenLogo } from "@/components/TokenLogo";
import type { PriceMap } from "@/hooks/usePrices";
import { ChevronRight } from "lucide-react";

interface TokenListProps {
  balances: Record<string, bigint | undefined>;
  isLoading: boolean;
  onSend: (token: Token) => void;
  prices: PriceMap;
  getUsdValue: (symbol: string, balance: bigint | undefined, decimals: number) => string;
  formatPrice: (symbol: string) => string;
}

export function TokenList({ balances, isLoading, onSend, prices, getUsdValue, formatPrice }: TokenListProps) {
  return (
    <div className="space-y-1 pb-2">
      {TOKENS.map((token) => {
        const balance  = balances[token.symbol];
        const usdValue = getUsdValue(token.symbol, balance, token.decimals);
        const price    = formatPrice(token.symbol);
        const hasBalance = balance !== undefined && balance > 0n;

        return (
          <div key={token.symbol} onClick={() => onSend(token)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer
                       hover:bg-surface2 active:bg-surface3 transition-colors group">
            <TokenLogo token={token} size={42} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-text">{token.symbol}</span>
                <span className={`font-mono text-[15px] font-semibold ${hasBalance ? "text-text" : "text-muted"}`}>
                  {isLoading && balance === undefined
                    ? <span className="skeleton h-4 w-16 inline-block" />
                    : formatTokenBalance(balance, token.decimals)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[12px] text-muted">{price || token.name}</span>
                <span className="text-[12px] text-muted">
                  {isLoading && balance === undefined
                    ? <span className="skeleton h-3 w-12 inline-block" />
                    : usdValue}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-border2 group-hover:text-muted transition-colors flex-shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
