"use client";
import { useState } from "react";
import type { Token } from "@/lib/tokens";

export function TokenLogo({ token, size = 40 }: { token: Token; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ width: size, height: size, background: token.bg, color: token.color, border: `1px solid ${token.color}33`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 800, flexShrink: 0 }}>
        {token.symbol.slice(0, 2)}
      </div>
    );
  }
  return (
    <img src={token.logo} alt={token.symbol} width={size} height={size} onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${token.color}22` }} />
  );
}
