"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, ExternalLink, ArrowUpRight, Fuel } from "lucide-react";
import { TOKENS, type Token } from "@/lib/tokens";
import { formatTokenBalance, isValidAddress, celoscanTx } from "@/lib/utils";
import { useSend, selectFeeCurrency } from "@/hooks/useSend";
import { TokenLogo } from "@/components/TokenLogo";

interface SendModalProps {
  initialToken: Token;
  balances: Record<string, bigint | undefined>;
  onClose: () => void;
  onSuccess: () => void;
  prefillAddress?: string;
  formatPrice?: (symbol: string) => string;
}

export function SendModal({
  initialToken,
  balances,
  onClose,
  onSuccess,
  prefillAddress = "",
  formatPrice,
}: SendModalProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(initialToken);
  const [recipient, setRecipient]         = useState(prefillAddress);
  const [amount, setAmount]               = useState("");
  const [validationError, setValidationError] = useState("");
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { send, status, reset } = useSend();

  const isSuccess = status.type === "success";
  const isPending = status.type === "pending";
  const isError   = status.type === "error";

  // Determine which token will pay the gas fee
  const feeCurrency = selectFeeCurrency(selectedToken, balances);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isSuccess) { const t = setTimeout(onSuccess, 3000); return () => clearTimeout(t); }
  }, [isSuccess, onSuccess]);

  const handleSend = async () => {
    setValidationError("");
    if (!isValidAddress(recipient))      { setValidationError("Invalid wallet address."); return; }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0)   { setValidationError("Enter a valid amount."); return; }
    const bal = balances[selectedToken.symbol];
    if (bal !== undefined) {
      const raw = BigInt(Math.floor(parsed * 10 ** selectedToken.decimals));
      if (raw > bal) { setValidationError("Insufficient balance."); return; }
    }
    await send({ token: selectedToken, to: recipient as `0x${string}`, amount, balances });
  };

  const setMax = () => {
    const bal = balances[selectedToken.symbol];
    if (bal !== undefined) setAmount(formatTokenBalance(bal, selectedToken.decimals, 6));
  };

  const handleClose = () => { reset(); onClose(); };

  const selectToken = (t: Token) => {
    setSelectedToken(t);
    setDropdownOpen(false);
    setValidationError("");
    setAmount("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-surface border border-border1 rounded-t-[28px] w-full max-w-md animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border1">
          <div className="w-8" />
          <h2 className="text-base font-bold text-text">Send</h2>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-muted hover:text-text transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Success */}
          {isSuccess && status.type === "success" ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✓
              </div>
              <h3 className="text-text font-bold text-lg mb-1">Transaction Sent!</h3>
              <p className="text-muted text-sm mb-2">
                Submitted to the Celo network.
              </p>
              {feeCurrency && (
                <p className="text-[11px] text-muted mb-5">
                  Gas paid in <span className="text-accent font-semibold">{feeCurrency.symbol}</span>
                </p>
              )}
              <a href={celoscanTx(status.hash)} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent
                           text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-accent/20 transition-colors">
                View on CeloScan <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <>
              {/* Token dropdown */}
              <div className="relative" ref={dropdownRef}>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Token</p>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center gap-3 bg-surface2 border border-border1
                             rounded-2xl px-4 py-3.5 hover:border-border2 transition-colors">
                  <TokenLogo token={selectedToken} size={32} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-text">{selectedToken.symbol}</div>
                    <div className="text-[11px] text-muted">
                      {formatTokenBalance(balances[selectedToken.symbol], selectedToken.decimals)} available
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-surface2 border border-border2
                                  rounded-2xl overflow-hidden z-20 shadow-2xl max-h-56 overflow-y-auto">
                    {TOKENS.map((t) => (
                      <button key={t.symbol} onClick={() => selectToken(t)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface3 transition-colors
                                    border-b border-border1 last:border-0
                                    ${selectedToken.symbol === t.symbol ? "bg-surface3" : ""}`}>
                        <TokenLogo token={t} size={28} />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold text-text">{t.symbol}</div>
                          <div className="text-[10px] text-muted">{formatPrice?.(t.symbol) || t.name}</div>
                        </div>
                        <div className="font-mono text-xs text-text">
                          {formatTokenBalance(balances[t.symbol], t.decimals)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recipient */}
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Recipient</p>
                <input type="text"
                  className="w-full bg-surface2 border border-border1 rounded-2xl px-4 py-3.5
                             font-mono text-sm text-white placeholder:text-muted placeholder:font-sans
                             focus:outline-none focus:border-accent transition-colors"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => { setRecipient(e.target.value); setValidationError(""); }} />
              </div>

              {/* Amount */}
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Amount</p>
                <div className="relative">
                  <input type="number" min="0" step="any"
                    className="w-full bg-surface2 border border-border1 rounded-2xl px-4 py-3.5
                               font-mono text-sm text-white placeholder:text-muted placeholder:font-sans
                               focus:outline-none focus:border-accent transition-colors pr-28"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setValidationError(""); }} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs text-muted font-semibold">{selectedToken.symbol}</span>
                    <button onClick={setMax}
                      className="text-[11px] font-bold text-accent bg-accent/10 border border-accent/20
                                 rounded-lg px-2 py-1 hover:bg-accent/20 transition-colors">
                      MAX
                    </button>
                  </div>
                </div>
                {balances[selectedToken.symbol] !== undefined && (
                  <p className="text-[11px] text-muted mt-1.5 font-mono px-1">
                    Balance: {formatTokenBalance(balances[selectedToken.symbol], selectedToken.decimals)} {selectedToken.symbol}
                  </p>
                )}
              </div>

              {/* Fee currency indicator */}
              <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 border
                ${feeCurrency
                  ? "bg-accent/5 border-accent/20"
                  : "bg-surface2 border-border1"}`}>
                <Fuel size={14} className={feeCurrency ? "text-accent" : "text-muted"} />
                <div className="flex-1">
                  <span className="text-[12px] font-semibold text-muted">Network fee paid in </span>
                  {feeCurrency ? (
                    <span className="text-[12px] font-bold text-accent">{feeCurrency.symbol}</span>
                  ) : (
                    <span className="text-[12px] font-bold text-celoGold">CELO</span>
                  )}
                </div>
                {!feeCurrency && (
                  <span className="text-[10px] text-muted">No stablecoins found</span>
                )}
              </div>

              {/* Errors */}
              {(validationError || isError) && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  <p className="text-danger text-xs">
                    {validationError || (isError && status.type === "error" ? status.message : "")}
                  </p>
                </div>
              )}

              {/* Send button */}
              <button onClick={handleSend} disabled={isPending || !recipient || !amount}
                className="w-full bg-accent hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed
                           text-bg font-bold rounded-2xl py-4 text-[15px] flex items-center justify-center gap-2
                           transition-all duration-200 hover:shadow-[0_8px_32px_rgba(74,222,128,0.4)]
                           hover:-translate-y-0.5">
                <ArrowUpRight size={18} />
                {isPending ? "Confirm in wallet…" : `Send ${selectedToken.symbol}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
