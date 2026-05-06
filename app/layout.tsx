import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CeloWallet — Web3 Wallet on Celo",
  description: "Send and receive CELO, USDm, USDC, USDT and more on the Celo network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}