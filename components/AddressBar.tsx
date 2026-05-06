"use client";

import { useState } from "react";
import { useDisconnect } from "wagmi";
import { Copy, Check, ExternalLink, LogOut } from "lucide-react";
import { shortenAddress, celoscanAddress } from "@/lib/utils";
import { useMiniPay } from "@/hooks/useMiniPay";

interface AddressBarProps {
  address: `0x${string}`;
}

export function AddressBar({ address }: AddressBarProps) {
  const [copied, setCopied] = useState(false);
  const { disconnect } = useDisconnect();
  const { isMiniPay } = useMiniPay();

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-border1 rounded-2xl px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Gradient avatar */}
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, #4ADE80 0%, #2563EB 100%)`,
          }}
        />
        <div>
          <div className="text-[10px] text-muted font-semibold tracking-wider uppercase mb-0.5">
            Connected Wallet
          </div>
          <div className="font-mono text-sm font-medium text-white">
            {shortenAddress(address)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Copy address */}
        <button
          onClick={copyAddress}
          title="Copy address"
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150
            ${copied
              ? "text-accent border-accent/30 bg-accent/10"
              : "text-muted border-border1 bg-surface2 hover:text-white hover:border-border2"
            }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>

        {/* CeloScan */}
        <a
          href={celoscanAddress(address)}
          target="_blank"
          rel="noreferrer"
          title="View on CeloScan"
          className="w-8 h-8 rounded-lg border border-border1 bg-surface2 flex items-center justify-center
                     text-muted hover:text-white hover:border-border2 transition-all duration-150"
        >
          <ExternalLink size={12} />
        </a>

        {/* Disconnect — hidden inside MiniPay (connection is implicit) */}
        {!isMiniPay && (
          <button
            onClick={() => disconnect()}
            title="Disconnect"
            className="w-8 h-8 rounded-lg border border-border1 bg-surface2 flex items-center justify-center
                       text-muted hover:text-danger hover:border-danger/30 transition-all duration-150"
          >
            <LogOut size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
