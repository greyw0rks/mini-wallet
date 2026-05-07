import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniWallet — Web3 Wallet on Celo",
  description:
    "Send and receive CELO, USDm, USDC, USDT and more on the Celo network. Works with MiniPay, MetaMask, and any EIP-1193 wallet.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
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
