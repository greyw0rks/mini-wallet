import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniWallet — Web3 Wallet on Celo",
  description: "Send and receive CELO, USDm, USDC, USDT and more on the Celo network. Works with MiniPay, MetaMask, and any EIP-1193 wallet.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  other: {
    "talentapp:project_verification": "315e27cea0c9ddff3ea8d3498636f9c479de70ddb0328e300a447c11cb85db5d7c774d50972f6e6c8d0bdcdd19b5bf59726150c24bfa7333b1e88707ac802751",
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
