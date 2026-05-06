"use client";

import { useState } from "react";
import { UserPlus, Send, Pencil, Trash2, BookUser, RefreshCw } from "lucide-react";
import { useContactBook, type Contact } from "@/hooks/contracts/useContactBook";
import { AddContactModal } from "./AddContactModal";
import { shortenAddress } from "@/lib/utils";

interface ContactBookProps {
  address: `0x${string}`;
  onSendToContact?: (address: string) => void;
}

export function ContactBook({ address, onSendToContact }: ContactBookProps) {
  const {
    contacts,
    isLoading,
    isWriting,
    writeError,
    addContact,
    updateContact,
    removeContact,
    refetch,
    contractDeployed,
  } = useContactBook(address);

  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState<(Contact & { index: number }) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  if (!contractDeployed) {
    return (
      <div className="bg-surface border border-border1 rounded-2xl p-6 text-center">
        <BookUser size={28} className="text-muted mx-auto mb-3" />
        <p className="text-sm text-muted">
          ContactBook contract not deployed yet.
          <br />
          Run <code className="font-mono text-accent text-xs">node scripts/deploy.mjs</code> first.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] font-semibold text-muted tracking-widest uppercase">
          Contacts ({contacts.length})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="text-muted hover:text-white transition-colors p-1"
          >
            <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-accent
                       bg-accent/10 border border-accent/20 rounded-lg px-2.5 py-1.5
                       hover:bg-accent/20 transition-colors"
          >
            <UserPlus size={11} /> Add
          </button>
        </div>
      </div>

      {/* Contact list */}
      <div className="bg-surface border border-border1 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2.5 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-10 text-center">
            <BookUser size={28} className="text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No contacts yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 text-xs text-accent font-semibold hover:underline"
            >
              Add your first contact →
            </button>
          </div>
        ) : (
          contacts.map((contact, i) => {
            const isLast = i === contacts.length - 1;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 group
                            ${!isLast ? "border-b border-border1" : ""}`}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                              text-xs font-bold text-bg"
                  style={{
                    background: `hsl(${(contact.name.charCodeAt(0) * 37) % 360}, 65%, 55%)`,
                  }}
                >
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {contact.name}
                  </div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">
                    {shortenAddress(contact.wallet)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onSendToContact && (
                    <button
                      onClick={() => onSendToContact(contact.wallet)}
                      title="Send to this contact"
                      className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center
                                 text-accent hover:bg-accent/20 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditTarget({ ...contact, index: i })}
                    title="Edit contact"
                    className="w-7 h-7 rounded-lg border border-border1 bg-surface2 flex items-center justify-center
                               text-muted hover:text-white transition-colors"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(i)}
                    title="Remove contact"
                    className="w-7 h-7 rounded-lg border border-border1 bg-surface2 flex items-center justify-center
                               text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {writeError && (
        <p className="text-danger text-xs text-center mt-2">{writeError}</p>
      )}

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] px-4 animate-fade-in">
          <div className="bg-surface border border-border2 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-1">Remove contact?</h3>
            <p className="text-muted text-sm mb-5">
              This will remove <strong className="text-white">{contacts[confirmDelete]?.name}</strong> from your on-chain address book.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-surface2 border border-border1 rounded-xl py-2.5 text-sm font-semibold text-white hover:border-border2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await removeContact(confirmDelete);
                  setConfirmDelete(null);
                }}
                disabled={isWriting}
                className="flex-1 bg-danger/20 border border-danger/30 rounded-xl py-2.5 text-sm font-semibold text-danger
                           hover:bg-danger/30 transition-colors disabled:opacity-50"
              >
                {isWriting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <AddContactModal
          onSave={addContact}
          onClose={() => setShowAdd(false)}
          isWriting={isWriting}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <AddContactModal
          onSave={(name, wallet) => updateContact(editTarget.index, name, wallet)}
          onClose={() => setEditTarget(null)}
          isWriting={isWriting}
          editContact={editTarget}
        />
      )}
    </>
  );
}
