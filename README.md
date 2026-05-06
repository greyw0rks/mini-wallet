# CeloWallet

A production-ready Web3 wallet dApp for the Celo network. Works with MiniPay, MetaMask, Rabby, and any EIP-1193 wallet.

## Features

- 🟡 **Native CELO** balance & sending
- 💚 **USDm (cUSD)**, USDC, USDT, cEUR, cREAL support
- 📱 **MiniPay-first** — auto-connects, hides disconnect UI, uses legacy tx type
- 🔄 Auto-refreshes balances every 30s
- 🔗 CeloScan links for address & transactions
- ✅ Input validation (address format, balance check)
- 🎨 Dark terminal aesthetic, Syne + JetBrains Mono fonts

## Stack

- **Next.js 14** (App Router)
- **wagmi v2** + **viem**
- **@tanstack/react-query**
- **Tailwind CSS v3**
- **lucide-react**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MiniPay Testing

Use ngrok to expose your local server:

```bash
ngrok http 3000
```

Then open the ngrok URL inside Opera Mini / MiniPay.

## Key MiniPay Requirements

All are handled automatically:

1. **Legacy transactions** — All sends use `type: "legacy"` (pre-EIP-1559) inside MiniPay
2. **Auto-connect** — Wallet connection is implicit; the app calls `connect()` on mount inside MiniPay
3. **No disconnect UI** — The disconnect button is hidden when `window.ethereum.isMiniPay` is true
4. **`window.ethereum` guards** — All provider access is gated

## Adding Tokens

Edit `lib/tokens.ts` and add an entry to the `TOKENS` array:

```ts
{
  symbol: "TOKEN",
  name: "My Token",
  address: "0x...", // ERC-20 contract address on Celo mainnet
  decimals: 18,
  color: "#FFFFFF",
  bg: "#111111",
}
```

## Project Structure

```
├── app/
│   ├── layout.tsx        # Root layout + fonts + providers
│   ├── page.tsx          # Main wallet page
│   ├── providers.tsx     # WagmiProvider + QueryClientProvider
│   └── globals.css       # Tailwind base + custom styles
├── components/
│   ├── WalletConnect.tsx # Connect screen
│   ├── AddressBar.tsx    # Address display + copy + CeloScan
│   ├── TokenList.tsx     # Token balance rows
│   └── SendModal.tsx     # Bottom-sheet send flow
├── hooks/
│   ├── useMiniPay.ts     # MiniPay detection
│   ├── useBalances.ts    # Multi-token balance fetching
│   └── useSend.ts        # Send native + ERC-20 with legacy tx support
└── lib/
    ├── tokens.ts         # Token registry + types
    ├── wagmi.ts          # wagmi config (Celo mainnet)
    └── utils.ts          # Format helpers, address utils
```

## Deployment

```bash
npm run build
npm run start
```

Deploy to Vercel, Netlify, or any Node.js host.

## Extending

- **Transaction history** — use `useReadContract` with Celo's event logs or Covalent API
- **Token prices** — integrate Celo's SortedOracles or Chainlink price feeds
- **QR scanner** — add `react-qr-reader` to the send modal
- **Receive screen** — show a QR code of the connected address
