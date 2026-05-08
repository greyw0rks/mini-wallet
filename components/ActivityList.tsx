"use client";

import { RefreshCw, ArrowUpRight, ArrowDownLeft, Code2, ExternalLink, AlertCircle, Inbox } from "lucide-react";
import type { ActivityItem } from "@/hooks/useActivity";
import { celoscanTx, shortenAddress } from "@/lib/utils";

interface ActivityListProps {
  activity: ActivityItem[];
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_CONFIG = {
  send:          { label: "Sent",          icon: <ArrowUpRight size={16} />,   color: "text-danger",   bg: "bg-danger/10 border-danger/20"   },
  receive:       { label: "Received",      icon: <ArrowDownLeft size={16} />,  color: "text-accent",   bg: "bg-accent/10 border-accent/20"   },
  contract:      { label: "Contract",      icon: <Code2 size={16} />,          color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  token_send:    { label: "Sent",          icon: <ArrowUpRight size={16} />,   color: "text-danger",   bg: "bg-danger/10 border-danger/20"   },
  token_receive: { label: "Received",      icon: <ArrowDownLeft size={16} />,  color: "text-accent",   bg: "bg-accent/10 border-accent/20"   },
};

export function ActivityList({ activity, loading, error, onRefresh }: ActivityListProps) {

  if (loading) {
    return (
      <div className="space-y-2 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl">
            <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-3 w-36" />
            </div>
            <div className="space-y-2 text-right">
              <div className="skeleton h-3.5 w-16 ml-auto" />
              <div className="skeleton h-3 w-10 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-12 px-6 text-center">
        <AlertCircle size={28} className="text-danger mb-3 opacity-70" />
        <p className="text-sm font-semibold text-text mb-1">Could not load activity</p>
        <p className="text-xs text-muted mb-4">CeloScan API may be rate-limited. Try again shortly.</p>
        <button onClick={onRefresh}
          className="flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/20 transition-colors">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-border1 flex items-center justify-center mb-4">
          <Inbox size={24} className="text-muted" />
        </div>
        <p className="text-sm font-semibold text-text mb-1">No transactions yet</p>
        <p className="text-xs text-muted">Send or receive tokens to see your activity here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 pb-2">
      {activity.map((tx, i) => {
        const cfg = TYPE_CONFIG[tx.type];
        const counterparty = tx.type === "send" || tx.type === "token_send" ? tx.to : tx.from;

        return (
          <a key={`${tx.hash}-${i}`} href={celoscanTx(tx.hash)} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface2 active:bg-surface3 transition-colors group">

            {/* Icon */}
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
              {cfg.icon}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-text">{cfg.label}</span>
                  <span className={`text-[12px] font-bold ${cfg.color}`}>{tx.token}</span>
                  {tx.status === "failed" && (
                    <span className="text-[10px] font-semibold text-danger bg-danger/10 border border-danger/20 rounded px-1.5 py-0.5">
                      Failed
                    </span>
                  )}
                </div>
                <span className={`font-mono text-[14px] font-semibold ${tx.type.includes("send") ? "text-danger" : "text-accent"}`}>
                  {tx.type.includes("send") ? "−" : "+"}{tx.amount || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted font-mono truncate max-w-[140px]">
                  {shortenAddress(counterparty)}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-muted">
                  {timeAgo(tx.timestamp)}
                  <ExternalLink size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
            </div>
          </a>
        );
      })}

      <p className="text-center text-[10px] text-muted pt-2 pb-1">
        Powered by CeloScan · Last 10 transactions
      </p>
    </div>
  );
}
