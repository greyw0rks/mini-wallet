/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["wagmi", "viem", "@wagmi/core", "lucide-react"],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
      "pino-pretty": false,
      "@walletconnect/ethereum-provider": false,
      "@walletconnect/universal-provider": false,
    };
    return config;
  },
};

export default nextConfig;