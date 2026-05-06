export type Token = {
  symbol: string;
  name: string;
  address: `0x${string}` | null;
  decimals: number;
  color: string;
  bg: string;
  logo: string;
  coingeckoId: string;
  native?: boolean;
};

const CG = "https://assets.coingecko.com/coins/images";

export const TOKENS: Token[] = [
  { symbol: "CELO",  name: "Celo",           address: null,                                         decimals: 18, color: "#FBCC5C", bg: "#2E2200", logo: `${CG}/11090/small/InjXBNx9_400x400.jpg`, coingeckoId: "celo", native: true },
  { symbol: "USDm",  name: "Celo Dollar",     address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18, color: "#00D395", bg: "#002015", logo: `${CG}/13161/small/icon-celo-dollar.png`,  coingeckoId: "celo-dollar" },
  { symbol: "USDC",  name: "USD Coin",        address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", decimals: 6,  color: "#2775CA", bg: "#001020", logo: `${CG}/6319/small/usdc.png`,              coingeckoId: "usd-coin" },
  { symbol: "USDT",  name: "Tether USD",      address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", decimals: 6,  color: "#26A17B", bg: "#001A10", logo: `${CG}/325/small/Tether.png`,             coingeckoId: "tether" },
  { symbol: "WETH",  name: "Wrapped Ether",   address: "0x66803FB87aBdf674Be5e06B7A1dAEe15A81CF75a", decimals: 18, color: "#627EEA", bg: "#0A0E2A", logo: `${CG}/279/small/ethereum.png`,           coingeckoId: "ethereum" },
  { symbol: "WBTC",  name: "Wrapped Bitcoin", address: "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE", decimals: 8,  color: "#F7931A", bg: "#2E1A00", logo: `${CG}/1/small/bitcoin.png`,              coingeckoId: "wrapped-bitcoin" },
  { symbol: "PAXG",  name: "PAX Gold",        address: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3", decimals: 18, color: "#E5B93E", bg: "#2A1F00", logo: `${CG}/9519/small/paxg.PNG`,              coingeckoId: "pax-gold" },
  { symbol: "cEUR",  name: "Celo Euro",       address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", decimals: 18, color: "#5B9BD5", bg: "#000D20", logo: `${CG}/13162/small/icon-celo-euro.png`,  coingeckoId: "celo-euro" },
  { symbol: "cREAL", name: "Celo Real",       address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787", decimals: 18, color: "#3DD68C", bg: "#001A10", logo: `${CG}/17498/small/cREAL_token.png`,     coingeckoId: "celo-real-token" },
];

export const CELO_CHAIN_ID = 42220;
