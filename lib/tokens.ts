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
  {
    symbol: "CELO",
    name: "Celo",
    address: null,
    decimals: 18,
    color: "#FBCC5C",
    bg: "#2E2200",
    logo: `${CG}/11090/small/InjXBNx9_400x400.jpg`,
    coingeckoId: "celo",
    native: true,
  },
  {
    symbol: "USDm",
    name: "Celo Dollar",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    decimals: 18,
    color: "#00D395",
    bg: "#002015",
    logo: `${CG}/13161/small/icon-celo-dollar.png`,
    coingeckoId: "celo-dollar",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    decimals: 6,
    color: "#26A17B",
    bg: "#001A10",
    logo: `${CG}/325/small/Tether.png`,
    coingeckoId: "tether",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xD221812de1BD094f35587EE8E174B07B6167D9Af",
    decimals: 18,
    color: "#627EEA",
    bg: "#0A0E2A",
    logo: `${CG}/279/small/ethereum.png`,
    coingeckoId: "ethereum",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D",
    decimals: 8,
    color: "#F7931A",
    bg: "#2E1A00",
    logo: `${CG}/1/small/bitcoin.png`,
    coingeckoId: "wrapped-bitcoin",
  },
  {
    symbol: "XAUt",
    name: "Tether Gold",
    address: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
    decimals: 6,
    color: "#E5B93E",
    bg: "#2A1F00",
    logo: `${CG}/10607/small/am1_200x200.png`,
    coingeckoId: "tether-gold",
  },
  {
    symbol: "cEUR",
    name: "Celo Euro",
    address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    decimals: 18,
    color: "#5B9BD5",
    bg: "#000D20",
    logo: `${CG}/13162/small/icon-celo-euro.png`,
    coingeckoId: "celo-euro",
  },
];

export const CELO_CHAIN_ID = 42220;
