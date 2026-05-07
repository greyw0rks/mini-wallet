"use client";
import { useConnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";

export function WalletConnect() {
  const { connect, isPending } = useConnect();
  const { switchChain } = useSwitchChain();
  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  const handleConnect = () => {
    connect({ connector: injected() }, { onSuccess: () => switchChain({ chainId: celo.id }) });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-10">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(74,222,128,0.3)]">
            <img src="/logo.svg" alt="MiniWallet" className="w-full h-full" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-2 border-bg animate-pulse-dot" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-text tracking-tight">MiniWallet</h1>
          <p className="text-sm text-muted mt-1">Your gateway to Celo DeFi</p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2.5 mb-8">
        {[
          { icon: "🪙", label: "Send & receive any Celo token" },
          { icon: "⚡", label: "Batch send to 50 wallets at once" },
          { icon: "📖", label: "On-chain contact book" },
          { icon: "📱", label: "MiniPay & MetaMask compatible" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3 bg-surface border border-border1 rounded-2xl px-4 py-3">
            <span className="text-lg">{f.icon}</span>
            <span className="text-sm text-text/80 font-medium">{f.label}</span>
          </div>
        ))}
      </div>

      {hasProvider ? (
        <button onClick={handleConnect} disabled={isPending}
          className="w-full max-w-xs bg-accent hover:bg-green-300 disabled:opacity-50 text-bg font-bold rounded-2xl py-4 text-base transition-all duration-200 hover:shadow-[0_8px_32px_rgba(74,222,128,0.4)] hover:-translate-y-0.5">
          {isPending ? "Connecting…" : "Connect Wallet"}
        </button>
      ) : (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-center text-sm text-muted">No wallet detected</p>
          <a href="https://metamask.io/download/" target="_blank" rel="noreferrer"
            className="block w-full text-center bg-surface border border-border2 rounded-2xl py-3.5 text-sm font-semibold text-text hover:border-accent/40 transition-colors">
            Install MetaMask ↗
          </a>
        </div>
      )}
    </div>
  );
}
