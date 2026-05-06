"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { isValidAddress } from "@/lib/utils";

interface AddContactModalProps {
  onSave: (name: string, wallet: `0x${string}`) => Promise<void>;
  onClose: () => void;
  isWriting: boolean;
  prefillAddress?: string;
  editContact?: { name: string; wallet: string; index: number };
}

export function AddContactModal({
  onSave,
  onClose,
  isWriting,
  prefillAddress = "",
  editContact,
}: AddContactModalProps) {
  const [name, setName]     = useState(editContact?.name ?? "");
  const [wallet, setWallet] = useState(editContact?.wallet ?? prefillAddress);
  const [error, setError]   = useState("");

  const isEdit = !!editContact;

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    if (name.trim().length > 50) { setError("Name must be 50 characters or fewer."); return; }
    if (!isValidAddress(wallet.trim())) { setError("Invalid wallet address."); return; }

    await onSave(name.trim(), wallet.trim() as `0x${string}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-[60] animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border2 rounded-t-3xl px-5 pb-8 pt-6 w-full max-w-md animate-slide-up">
        <div className="w-10 h-1 bg-border2 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <UserPlus size={14} />
            </div>
            <h2 className="text-base font-bold text-white">
              {isEdit ? "Edit Contact" : "Add Contact"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border1 bg-surface2 flex items-center justify-center text-muted hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-semibold text-muted tracking-wider uppercase mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              maxLength={50}
              className="w-full bg-surface2 border border-border1 rounded-xl px-3.5 py-3 text-sm
                         text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. Alice, My sister, Treasury"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
            <p className="text-[10px] text-muted mt-1 text-right">{name.length}/50</p>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-[10px] font-semibold text-muted tracking-wider uppercase mb-1.5">
              Wallet Address
            </label>
            <input
              type="text"
              className="w-full bg-surface2 border border-border1 rounded-xl px-3.5 py-3
                         font-mono text-sm text-white placeholder:text-muted placeholder:font-sans
                         focus:outline-none focus:border-accent transition-colors"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => { setWallet(e.target.value); setError(""); }}
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2.5">
              <p className="text-danger text-xs">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isWriting}
            className="w-full bg-accent hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed
                       text-bg font-bold rounded-xl py-3.5 text-sm transition-all duration-200
                       hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)]
                       flex items-center justify-center gap-2"
          >
            <UserPlus size={15} />
            {isWriting ? "Saving on-chain…" : isEdit ? "Update Contact" : "Save Contact"}
          </button>

          <p className="text-[11px] text-muted text-center">
            Stored on Celo Mainnet — accessible from any device.
          </p>
        </div>
      </div>
    </div>
  );
}
