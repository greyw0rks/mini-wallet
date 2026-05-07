import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "#0B0B1A",
        surface:  "#13132A",
        surface2: "#1C1C38",
        surface3: "#252545",
        border1:  "#2A2A50",
        border2:  "#363660",
        accent:   "#4ADE80",
        celoGold: "#FBCC5C",
        muted:    "#6B6B9A",
        danger:   "#F87171",
        text:     "#E8E8FF",
      },
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-dot":  "pulse-dot 2s ease-in-out infinite",
        shimmer:      "shimmer 1.5s linear infinite",
        "slide-up":   "slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in":    "fade-in 0.2s ease",
        "scale-in":   "scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "pulse-dot":  { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: "0.5", transform: "scale(0.8)" } },
        shimmer:      { to: { backgroundPosition: "-200% 0" } },
        "slide-up":   { from: { transform: "translateY(100%)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "fade-in":    { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in":   { from: { transform: "scale(0.95)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};
export default config;
