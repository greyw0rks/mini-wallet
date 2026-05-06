"use client";

import { useState, useEffect } from "react";
import { X, Send, ExternalLink } from "lucide-react";
import { TOKENS, type Token } from "@/lib/tokens";
import { formatTokenBalance, isValidAddress, celoscanTx } from "@/lib/utils";
import { useSend } from "@/hooks/useSend";

interface SendModalProps {
  initialToken: Token;
  balances: Record<string, bigint | undefined>;
  onClose: () => void;
  onSuccess: () => void;
  prefillAddress?: string;
  formatPrice?: (symbol: string) => string;  // ← add this line
}

export function SendModal({ initialToken, balances, onClose, onSuccess, prefillAddress = "" }: SendModalProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(initialToken);
  const [recipient, setRecipient] = useState(prefillAddress);
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  const { send, status, reset } = useSend();

  // Trigger refetch after success
  useEffect(() => {
    if (status.type === "success") {
      const t = setTimeout(() => {
        onSuccess();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [status, onSuccess]);

  const handleSend = async () => {
    setValidationError("");

    if (!isValidAddress(recipient)) {
      setValidationError("Invalid Ethereum address.");
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setValidationError("Enter a valid amount.");
      return;
    }
    const bal = balances[selectedToken.symbol];
    if (bal !== undefined) {
      const rawAmount = BigInt(Math.floor(parsed * 10 ** selectedToken.decimals));
      if (rawAmount > bal) {
        setValidationError("Insufficient balance.");
        return;
      }
    }

    await send({
      token: selectedToken,
      to: recipient as `0x${string}`,
      amount,
    });
  };

  const setMax = () => {
    const bal = balances[selectedToken.symbol];
    if (bal !== undefined) {
      setAmount(formatTokenBalance(bal, selectedToken.decimals, 6));
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSuccess = status.type === "success";
  const isPending = status.type === "pending";
  const isError = status.type === "error";

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-surface border border-border2 rounded-t-3xl px-5 pb-8 pt-6 w-full max-w-md animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-border2 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Send Token</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg border border-border1 bg-surface2 flex items-center justify-center
                       text-muted hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Success state */}
        {isSuccess && status.type === "success" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Sent!</h3>
            <p className="text-muted text-sm mb-4">Transaction submitted successfully.</p>
            <a
              href={celoscanTx(status.hash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:underline"
            >
              View on CeloScan <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Form state */}
        {!isSuccess && (
          <>
            {/* Token selector */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {TOKENS.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => { setSelectedToken(t); setValidationError(""); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
                    ${selectedToken.symbol === t.symbol
                      ? "text-bg border-transparent"
                      : "text-muted border-border1 bg-surface2 hover:text-white"
                    }`}
                  style={
                    selectedToken.symbol === t.symbol
                      ? { background: t.color }
                      : {}
                  }
                >
                  {t.symbol}
                </button>
              ))}
            </div>

            {/* Recipient */}
            <div className="mb-3">
              <label className="block text-[10px] font-semibold text-muted tracking-wider uppercase mb-1.5">
                Recipient Address
              </label>
              <input
                type="text"
                className="w-full bg-surface2 border border-border1 rounded-xl px-3.5 py-3
                           font-mono text-sm text-white placeholder:text-muted placeholder:font-sans
                           focus:outline-none focus:border-accent transition-colors"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => { setRecipient(e.target.value); setValidationError(""); }}
              />
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-muted tracking-wider uppercase mb-1.5">
                Amount ({selectedToken.symbol})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="flex-1 bg-surface2 border border-border1 rounded-xl px-3.5 py-3
                             font-mono text-sm text-white placeholder:text-muted placeholder:font-sans
                             focus:outline-none focus:border-accent transition-colors"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setValidationError(""); }}
                />
                <button
                  onClick={setMax}
                  className="px-3.5 py-3 bg-accent/10 border border-accent/20 rounded-xl
                             text-accent text-xs font-bold hover:bg-accent/20 transition-colors whitespace-nowrap"
                >
                  MAX
                </button>
              </div>

              {balances[selectedToken.symbol] !== undefined && (
                <p className="text-[11px] text-muted mt-1.5 font-mono">
                  Balance:{" "}
                  {formatTokenBalance(balances[selectedToken.symbol], selectedToken.decimals)}{" "}
                  {selectedToken.symbol}
                </p>
              )}
            </div>

            {/* Errors */}
            {(validationError || isError) && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2.5 mb-3">
                <p className="text-danger text-xs">
                  {validationError || (isError && status.type === "error" ? status.message : "")}
                </p>
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isPending || !recipient || !amount}
              className="w-full bg-accent hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed
                         text-bg font-bold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2
                         transition-all duration-200 hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)] active:translate-y-0"
            >
              <Send size={15} />
              {isPending ? "Confirm in wallet…" : `Send ${selectedToken.symbol}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
