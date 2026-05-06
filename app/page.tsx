"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import { Send, Layers, BookUser } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { AddressBar } from "@/components/AddressBar";
import { TokenList } from "@/components/TokenList";
import { SendModal } from "@/components/SendModal";
import { BatchSendModal } from "@/components/batch/BatchSendModal";
import { ContactBook } from "@/components/contacts/ContactBook";
import { useBalances } from "@/hooks/useBalances";
import { useMiniPay } from "@/hooks/useMiniPay";
import { usePrices } from "@/hooks/usePrices";
import { useContactBook } from "@/hooks/contracts/useContactBook";
import { TOKENS, type Token } from "@/lib/tokens";

type Tab = "wallet" | "batch" | "contacts";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect }              = useConnect();
  const { switchChain }          = useSwitchChain();
  const { isMiniPay }            = useMiniPay();
  const { balances, isLoading, refetch }                           = useBalances(address);
  const { prices, getUsdValue, formatPrice, loading: pricesLoading } = usePrices();
  const { contacts }                                               = useContactBook(address);

  const [tab, setTab]                 = useState<Tab>("wallet");
  const [sendModal, setSendModal]     = useState(false);
  const [batchModal, setBatchModal]   = useState(false);
  const [sendToken, setSendToken]     = useState<Token>(TOKENS[0]);
  const [prefillAddr, setPrefillAddr] = useState("");

  useEffect(() => {
    if (isMiniPay && !isConnected)
      connect({ connector: injected() }, { onSuccess: () => switchChain({ chainId: celo.id }) });
  }, [isMiniPay, isConnected, connect, switchChain]);

  const openSend = (token: Token) => { setSendToken(token); setSendModal(true); };
  const sendToContact = (addr: string) => { setPrefillAddr(addr); setSendToken(TOKENS[0]); setSendModal(true); setTab("wallet"); };

  const tabs = [
    { id: "wallet"   as Tab, label: "Wallet",   icon: <Send size={15} /> },
    { id: "batch"    as Tab, label: "Batch",    icon: <Layers size={15} /> },
    { id: "contacts" as Tab, label: "Contacts", icon: <BookUser size={15} /> },
  ];

  return (
    <main className="max-w-md mx-auto px-4 py-4 min-h-screen flex flex-col gap-3">
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="CeloWallet" width={36} height={36} className="rounded-xl" />
          <span className="text-[17px] font-extrabold text-white tracking-tight">CeloWallet</span>
        </div>
        <div className="text-[10px] font-semibold font-mono text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1 tracking-wider">CELO MAINNET</div>
      </div>

      {!isConnected ? <WalletConnect /> : (
        <>
          <AddressBar address={address!} />

          <div className="flex bg-surface border border-border1 rounded-xl p-1 gap-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${tab === t.id ? "bg-accent text-bg" : "text-muted hover:text-white"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {tab === "wallet" && (
            <>
              <button onClick={() => openSend(TOKENS[0])}
                className="w-full bg-accent hover:bg-green-300 text-bg font-bold rounded-2xl py-4 flex items-center justify-center gap-2.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)]">
                <Send size={16} /> Send Token
              </button>
              <TokenList balances={balances} isLoading={isLoading} onRefresh={refetch} onSend={openSend} prices={prices} getUsdValue={getUsdValue} formatPrice={formatPrice} pricesLoading={pricesLoading} />
            </>
          )}

          {tab === "batch" && (
            <div className="flex flex-col gap-3">
              <div className="bg-surface border border-border1 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><Layers size={18} /></div>
                  <div><div className="text-sm font-bold text-white">Batch Sender</div><div className="text-xs text-muted mt-0.5">Send to up to 50 wallets in one tx</div></div>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-4">Supports all tokens. Set individual amounts or split equally. Contacts auto-populate.</p>
                <button onClick={() => setBatchModal(true)}
                  className="w-full bg-accent hover:bg-green-300 text-bg font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(74,222,128,0.3)]">
                  <Layers size={15} /> Open Batch Sender
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[["Max recipients","50 / tx"],["Tokens","9 supported"],["Equal split","✓"],["Custom amounts","✓"]].map(([label,value]) => (
                  <div key={label} className="bg-surface border border-border1 rounded-xl px-4 py-3">
                    <div className="text-[10px] text-muted uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-sm font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "contacts" && <ContactBook address={address!} onSendToContact={sendToContact} />}

          <p className="text-center text-[10px] text-muted pb-6 leading-relaxed mt-auto">
            Powered by <a href="https://forno.celo.org" target="_blank" rel="noreferrer" className="hover:text-white">forno.celo.org</a> · Prices via CoinGecko
          </p>
        </>
      )}

      {sendModal && isConnected && (
        <SendModal initialToken={sendToken} balances={balances} prefillAddress={prefillAddr} formatPrice={formatPrice}
          onClose={() => { setSendModal(false); setPrefillAddr(""); }}
          onSuccess={() => { setSendModal(false); setTimeout(refetch, 3000); }} />
      )}
      {batchModal && isConnected && <BatchSendModal contacts={contacts} onClose={() => setBatchModal(false)} />}
    </main>
  );
}
