"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useSwitchChain, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import {
  ArrowUpRight, ArrowDownLeft, Copy, Check,
  LayoutGrid, BookUser, Home as HomeIcon, Settings, RefreshCw,
  ChevronDown, LogOut, ExternalLink, Layers
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { TokenList } from "@/components/TokenList";
import { SendModal } from "@/components/SendModal";
import { BatchSendModal } from "@/components/batch/BatchSendModal";
import { ContactBook } from "@/components/contacts/ContactBook";
import { useBalances } from "@/hooks/useBalances";
import { useMiniPay } from "@/hooks/useMiniPay";
import { usePrices } from "@/hooks/usePrices";
import { useContactBook } from "@/hooks/contracts/useContactBook";
import { TOKENS, type Token } from "@/lib/tokens";
import { shortenAddress, celoscanAddress } from "@/lib/utils";

type Tab = "home" | "batch" | "contacts" | "settings";

// Deterministic avatar gradient from address
function avatarGradient(addr: string) {
  const h1 = parseInt(addr.slice(2, 8), 16) % 360;
  const h2 = (h1 + 120) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,55%) 0%, hsl(${h2},70%,45%) 100%)`;
}

export default function Home() {
  const { address, isConnected }  = useAccount();
  const { connect }               = useConnect();
  const { switchChain }           = useSwitchChain();
  const { disconnect }            = useDisconnect();
  const { isMiniPay }             = useMiniPay();

  const { balances, isLoading, refetch }                             = useBalances(address);
  const { prices, getUsdValue, formatPrice, loading: pricesLoading } = usePrices();
  const { contacts }                                                 = useContactBook(address);

  const [tab, setTab]                 = useState<Tab>("home");
  const [sendModal, setSendModal]     = useState(false);
  const [batchModal, setBatchModal]   = useState(false);
  const [sendToken, setSendToken]     = useState<Token>(TOKENS[0]);
  const [prefillAddr, setPrefillAddr] = useState("");
  const [copied, setCopied]           = useState(false);
  const [tokenTab, setTokenTab] = useState<"tokens" | "activity">("tokens");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isMiniPay && !isConnected)
      connect({ connector: injected() }, { onSuccess: () => switchChain({ chainId: celo.id }) });
  }, [isMiniPay, isConnected, connect, switchChain]);

  const openSend = (token: Token) => { setSendToken(token); setSendModal(true); };
  const sendToContact = (addr: string) => {
    setPrefillAddr(addr); setSendToken(TOKENS[0]); setSendModal(true); setTab("home");
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Total portfolio USD
  const totalUsd = TOKENS.reduce((sum, t) => {
    const p = prices[t.symbol], b = balances[t.symbol];
    if (!p || b === undefined) return sum;
    return sum + (Number(b) / 10 ** t.decimals) * p;
  }, 0);

  const bottomNav = [
    { id: "home"     as Tab, icon: <HomeIcon size={20} />,        label: "Wallet"   },
    { id: "batch"    as Tab, icon: <Layers size={20} />,      label: "Batch"    },
    { id: "contacts" as Tab, icon: <BookUser size={20} />,    label: "Contacts" },
    { id: "settings" as Tab, icon: <Settings size={20} />,    label: "Settings" },
  ];

  if (!mounted) return null;
if (!isConnected) return <WalletConnect />;

  return (
    <div className="max-w-md mx-auto flex flex-col min-h-screen bg-bg">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        {/* Network pill */}
        <div className="flex items-center gap-1.5 bg-surface border border-border1 rounded-full px-3 py-1.5 cursor-pointer hover:border-border2 transition-colors">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
          <span className="text-[11px] font-semibold text-text">Celo</span>
          <ChevronDown size={10} className="text-muted" />
        </div>

        {/* Logo */}
        <img src="/logo.svg" alt="MiniWallet" width={32} height={32} className="rounded-xl" />

        {/* Refresh */}
        <button onClick={refetch} className="w-8 h-8 rounded-full bg-surface border border-border1 flex items-center justify-center text-muted hover:text-text transition-colors">
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <>
            {/* Account card */}
            <div className="mx-4 mt-2 mb-4">
              <div className="bg-surface border border-border1 rounded-3xl px-5 py-5">
                {/* Avatar + address */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-full mb-3 ring-4 ring-bg shadow-lg"
                    style={{ background: avatarGradient(address!) }} />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted">{shortenAddress(address!)}</span>
                    <button onClick={copyAddress}
                      className={`transition-colors ${copied ? "text-accent" : "text-muted hover:text-text"}`}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <a href={celoscanAddress(address!)} target="_blank" rel="noreferrer" className="text-muted hover:text-text transition-colors">
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Balance */}
                <div className="text-center mb-6">
                  {pricesLoading && totalUsd === 0 ? (
                    <span className="skeleton h-9 w-40 block mx-auto" />
                  ) : (
                    <div className="text-[32px] font-extrabold text-text tracking-tight leading-none">
                      ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  <p className="text-sm text-muted mt-1">Total Balance</p>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Send",    icon: <ArrowUpRight size={20} />,  action: () => openSend(TOKENS[0]),      color: "text-accent"   },
                    { label: "Receive", icon: <ArrowDownLeft size={20} />, action: () => {},                       color: "text-celoGold" },
                    { label: "Batch",   icon: <Layers size={20} />,        action: () => setBatchModal(true),      color: "text-blue-400" },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action}
                      className="flex flex-col items-center gap-2 bg-surface2 hover:bg-surface3 active:scale-95
                                 border border-border1 rounded-2xl py-4 transition-all duration-150">
                      <div className={`${btn.color}`}>{btn.icon}</div>
                      <span className="text-xs font-semibold text-text">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Token / Activity tabs */}
            <div className="mx-4 mb-3">
              <div className="flex bg-surface border border-border1 rounded-2xl p-1">
                {(["tokens", "activity"] as const).map((t) => (
                  <button key={t} onClick={() => setTokenTab(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-150
                                ${tokenTab === t ? "bg-surface3 text-text shadow-sm" : "text-muted hover:text-text"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tokenTab === "tokens" ? (
              <div className="mx-2">
                <TokenList
                  balances={balances}
                  isLoading={isLoading}
                  onSend={openSend}
                  prices={prices}
                  getUsdValue={getUsdValue}
                  formatPrice={formatPrice}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-muted">
                <LayoutGrid size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1 opacity-60">Transactions will appear here</p>
              </div>
            )}
          </>
        )}

        {/* ── BATCH TAB ── */}
        {tab === "batch" && (
          <div className="px-4 pt-4 space-y-3">
            <h2 className="text-lg font-bold text-text">Batch Sender</h2>
            <div className="bg-surface border border-border1 rounded-3xl p-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Layers size={22} />
              </div>
              <h3 className="text-base font-bold text-text mb-1">Send to multiple wallets</h3>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Send CELO or any ERC-20 token to up to 50 addresses in a single transaction. Set custom or equal amounts.
              </p>
              <button onClick={() => setBatchModal(true)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-bold
                           rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors">
                <Layers size={16} /> Open Batch Sender
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[["Max wallets","50 / tx"],["Tokens","9 supported"],["Equal split","✓"],["Custom amounts","✓"]].map(([k,v]) => (
                <div key={k} className="bg-surface border border-border1 rounded-2xl px-4 py-3.5">
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-sm font-bold text-text">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {tab === "contacts" && (
          <div className="px-4 pt-4">
            <h2 className="text-lg font-bold text-text mb-3">Contacts</h2>
            <ContactBook address={address!} onSendToContact={sendToContact} />
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <div className="px-4 pt-4 space-y-3">
            <h2 className="text-lg font-bold text-text">Settings</h2>

            {/* Account info */}
            <div className="bg-surface border border-border1 rounded-3xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border1">
                <div className="w-10 h-10 rounded-full" style={{ background: avatarGradient(address!) }} />
                <div>
                  <div className="text-sm font-bold text-text">Account 1</div>
                  <div className="font-mono text-[11px] text-muted">{shortenAddress(address!)}</div>
                </div>
              </div>
              {!isMiniPay && (
                <button onClick={() => disconnect()}
                  className="w-full flex items-center gap-3 px-4 py-4 text-danger hover:bg-surface2 transition-colors">
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">Disconnect Wallet</span>
                </button>
              )}
            </div>

            {/* Links */}
            <div className="bg-surface border border-border1 rounded-3xl overflow-hidden">
              {[
                { label: "View on CeloScan", href: celoscanAddress(address!) },
                { label: "Celo Network Docs", href: "https://docs.celo.org" },
                { label: "Report an Issue", href: "https://github.com/greyw0rks/celo-wallet/issues" },
              ].map((item, i, arr) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                  className={`flex items-center justify-between px-4 py-4 hover:bg-surface2 transition-colors
                              ${i < arr.length - 1 ? "border-b border-border1" : ""}`}>
                  <span className="text-sm font-medium text-text">{item.label}</span>
                  <ExternalLink size={13} className="text-muted" />
                </a>
              ))}
            </div>

            <p className="text-center text-[11px] text-muted pt-2">
              MiniWallet v0.1.0 · Powered by forno.celo.org
              <br />Prices via CoinGecko
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
        <div className="w-full max-w-md glass border-t border-border1 px-2 pb-safe">
          <div className="flex">
            {bottomNav.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
                            ${tab === n.id ? "text-accent" : "text-muted hover:text-text"}`}>
                {n.icon}
                <span className="text-[10px] font-semibold">{n.label}</span>
                {tab === n.id && <div className="w-4 h-0.5 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {sendModal && isConnected && (
        <SendModal initialToken={sendToken} balances={balances} prefillAddress={prefillAddr}
          formatPrice={formatPrice}
          onClose={() => { setSendModal(false); setPrefillAddr(""); }}
          onSuccess={() => { setSendModal(false); setTimeout(refetch, 3000); }} />
      )}
      {batchModal && isConnected && (
        <BatchSendModal contacts={contacts} onClose={() => setBatchModal(false)} />
      )}
    </div>
  );
}
