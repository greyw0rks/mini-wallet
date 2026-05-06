"use client";

import { useState } from "react";
import { X, Plus, Trash2, Send, ExternalLink, ChevronDown } from "lucide-react";
import { TOKENS, type Token } from "@/lib/tokens";
import { isValidAddress, celoscanTx } from "@/lib/utils";
import { useBatchSend, type Recipient } from "@/hooks/contracts/useBatchSend";
import type { Contact } from "@/hooks/contracts/useContactBook";

interface BatchSendModalProps {
  contacts: Contact[];
  onClose: () => void;
}

const EMPTY_RECIPIENT = (): Recipient => ({ address: "", amount: "" });

export function BatchSendModal({ contacts, onClose }: BatchSendModalProps) {
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [recipients, setRecipients] = useState<Recipient[]>([EMPTY_RECIPIENT()]);
  const [equalSplit, setEqualSplit] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [contactPickerIdx, setContactPickerIdx] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const { batchSend, status, reset } = useBatchSend();

  const isSuccess = status.type === "success";
  const isPending = status.type === "pending";
  const isApproving = status.type === "approving";
  const isError = status.type === "error";

  // ── Recipient management ───────────────────────────────────────────────────

  const addRow = () => {
    if (recipients.length >= 50) return;
    setRecipients([...recipients, EMPTY_RECIPIENT()]);
  };

  const removeRow = (i: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== i));
  };

  const updateRow = (i: number, field: keyof Recipient, value: string) => {
    const next = [...recipients];
    next[i] = { ...next[i], [field]: value };
    setRecipients(next);
  };

  const pickContact = (rowIdx: number, contact: Contact) => {
    const next = [...recipients];
    next[rowIdx] = { ...next[rowIdx], address: contact.wallet };
    setRecipients(next);
    setContactPickerIdx(null);
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: string[] = [];
    recipients.forEach((r, i) => {
      if (!isValidAddress(r.address)) errs.push(`Row ${i + 1}: invalid address`);
      if (!r.amount || parseFloat(r.amount) <= 0)
        errs.push(`Row ${i + 1}: invalid amount`);
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    await batchSend({ token: selectedToken, recipients, equalSplit });
  };

  // ── Total ──────────────────────────────────────────────────────────────────

  const computeTotal = () => {
    try {
      if (equalSplit) {
        const each = parseFloat(recipients[0]?.amount || "0");
        return (each * recipients.length).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        });
      }
      return recipients
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
        .toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch {
      return "—";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border2 rounded-t-3xl w-full max-w-md max-h-[92vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex-shrink-0">
          <div className="w-10 h-1 bg-border2 rounded-full mx-auto mb-5" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Batch Send</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border1 bg-surface2 flex items-center justify-center text-muted hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-4">

          {isSuccess && status.type === "success" ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Batch Sent!</h3>
              <p className="text-muted text-sm mb-4">
                {recipients.length} recipients · {computeTotal()} {selectedToken.symbol}
              </p>
              <a
                href={celoscanTx(status.hash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:underline"
              >
                View on CeloScan <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <>
              {/* Token selector */}
              <div className="relative">
                <button
                  onClick={() => setTokenOpen(!tokenOpen)}
                  className="w-full flex items-center justify-between bg-surface2 border border-border1 rounded-xl px-4 py-3 hover:border-border2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                      style={{ background: selectedToken.bg, color: selectedToken.color }}
                    >
                      {selectedToken.symbol.slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-white">{selectedToken.symbol}</span>
                  </div>
                  <ChevronDown size={14} className={`text-muted transition-transform ${tokenOpen ? "rotate-180" : ""}`} />
                </button>
                {tokenOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-surface2 border border-border2 rounded-xl overflow-hidden z-10 shadow-xl">
                    {TOKENS.map((t) => (
                      <button
                        key={t.symbol}
                        onClick={() => { setSelectedToken(t); setTokenOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left transition-colors"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                          style={{ background: t.bg, color: t.color }}
                        >
                          {t.symbol.slice(0, 2)}
                        </div>
                        <span className="text-sm text-white">{t.symbol}</span>
                        <span className="text-xs text-muted ml-auto">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equal split toggle */}
              <div className="flex items-center justify-between bg-surface2 border border-border1 rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">Equal split</div>
                  <div className="text-xs text-muted mt-0.5">Same amount to all recipients</div>
                </div>
                <button
                  onClick={() => setEqualSplit(!equalSplit)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${equalSplit ? "bg-accent" : "bg-border2"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${equalSplit ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-muted tracking-widest uppercase">
                  Recipients ({recipients.length})
                </div>

                {recipients.map((r, i) => (
                  <div key={i} className="bg-surface2 border border-border1 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted w-4">{i + 1}</span>

                      {/* Address input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          className="w-full bg-surface border border-border1 rounded-lg px-3 py-2
                                     font-mono text-xs text-white placeholder:text-muted placeholder:font-sans
                                     focus:outline-none focus:border-accent transition-colors pr-20"
                          placeholder="0x... or pick contact"
                          value={r.address}
                          onChange={(e) => updateRow(i, "address", e.target.value)}
                        />
                        {contacts.length > 0 && (
                          <button
                            onClick={() => setContactPickerIdx(contactPickerIdx === i ? null : i)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-accent font-semibold
                                       bg-accent/10 border border-accent/20 rounded-md px-2 py-0.5 hover:bg-accent/20 transition-colors"
                          >
                            Contacts
                          </button>
                        )}
                      </div>

                      {/* Amount — show one shared field if equal split */}
                      {(!equalSplit || i === 0) && (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="w-24 bg-surface border border-border1 rounded-lg px-3 py-2
                                     font-mono text-xs text-white placeholder:text-muted placeholder:font-sans
                                     focus:outline-none focus:border-accent transition-colors"
                          placeholder="Amount"
                          value={equalSplit ? recipients[0].amount : r.amount}
                          onChange={(e) =>
                            equalSplit
                              ? setRecipients(recipients.map((rec) => ({ ...rec, amount: e.target.value })))
                              : updateRow(i, "amount", e.target.value)
                          }
                        />
                      )}

                      {/* Remove row */}
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRow(i)}
                          className="text-muted hover:text-danger transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Contact picker dropdown */}
                    {contactPickerIdx === i && (
                      <div className="border border-border2 rounded-lg overflow-hidden bg-surface">
                        {contacts.map((c, ci) => (
                          <button
                            key={ci}
                            onClick={() => pickContact(i, c)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface2 transition-colors text-left border-b border-border1 last:border-0"
                          >
                            <span className="text-sm text-white font-medium">{c.name}</span>
                            <span className="font-mono text-xs text-muted">
                              {c.wallet.slice(0, 6)}…{c.wallet.slice(-4)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add row */}
                <button
                  onClick={addRow}
                  disabled={recipients.length >= 50}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-border2
                             rounded-xl py-2.5 text-xs text-muted hover:text-white hover:border-border1
                             transition-colors disabled:opacity-30"
                >
                  <Plus size={13} /> Add recipient {recipients.length >= 50 && "(max 50)"}
                </button>
              </div>

              {/* Summary */}
              <div className="bg-surface2 border border-border1 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-muted">Total</span>
                <span className="font-mono text-sm font-semibold text-white">
                  {computeTotal()} {selectedToken.symbol}
                </span>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 space-y-1">
                  {errors.map((e, i) => (
                    <p key={i} className="text-danger text-xs">{e}</p>
                  ))}
                </div>
              )}

              {isError && status.type === "error" && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  <p className="text-danger text-xs">{status.message}</p>
                </div>
              )}

              {/* ERC-20 note */}
              {!selectedToken.native && (
                <p className="text-[11px] text-muted text-center">
                  Two transactions required for ERC-20: approve + batch send.
                </p>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isPending || isApproving}
                className="w-full bg-accent hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed
                           text-bg font-bold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2
                           transition-all duration-200 hover:-translate-y-0.5
                           hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)]"
              >
                <Send size={15} />
                {isApproving
                  ? "Approving token…"
                  : isPending
                  ? "Confirm in wallet…"
                  : `Send to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
