"use client";

import { useConnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import { Wallet } from "lucide-react";
import { useMiniPay } from "@/hooks/useMiniPay";

export function WalletConnect() {
  const { connect, isPending } = useConnect();
  const { switchChain } = useSwitchChain();
  const { hasProvider } = useMiniPay();

  const handleConnect = async () => {
    connect(
      { connector: injected() },
      {
        onSuccess() {
          // Force switch to Celo after connect
          switchChain({ chainId: celo.id });
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 bg-surface border border-border1 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
        <Wallet size={28} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-sm text-muted leading-relaxed">
          Works with MiniPay, MetaMask, Rabby,
          <br />
          and any EIP-1193 compatible wallet.
        </p>
      </div>

      {hasProvider ? (
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="w-full bg-accent hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed
                     text-bg font-bold rounded-xl py-3.5 text-sm transition-all duration-200
                     hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)]
                     active:translate-y-0"
        >
          {isPending ? "Connecting…" : "Connect Wallet"}
        </button>
      ) : (
        <div className="w-full">
          <p className="text-xs text-muted mb-3">No wallet detected</p>
          <a
            href="https://www.opera.com/mobile"
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-surface2 border border-border2 hover:border-accent/30
                       text-white font-semibold rounded-xl py-3.5 text-sm transition-all duration-200"
          >
            Get MiniPay / Opera Mini ↗
          </a>
        </div>
      )}
    </div>
  );
}
