"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    const check = () => {
      setHasProvider(!!window.ethereum);
      setIsMiniPay(!!window.ethereum?.isMiniPay);
    };
    check();
    // Give injected providers time to load
    const timeout = setTimeout(check, 500);
    return () => clearTimeout(timeout);
  }, []);

  return { isMiniPay, hasProvider };
}
