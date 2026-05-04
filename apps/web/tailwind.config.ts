import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b10",
        surface: "#121318",
        "surface-container": "#121318",
        "surface-container-high": "#1c1d24",
        "surface-container-highest": "#292a2f",
        mint: "#00ff9f",
        amber: "#ffb800",
        "deep-blue": "#0a0b10",
        outline: "#2d3142",
        "on-surface": "#e3e1e9",
        "on-surface-variant": "#849587",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        pixel: "2px 2px 0px 0px #000000",
        glow: "0 0 20px rgba(0, 255, 159, 0.2)",
        "mint-glow": "0 0 30px rgba(0, 255, 159, 0.15)",
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1c1d24 1px, transparent 1px), linear-gradient(to bottom, #1c1d24 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-lg': '60px 60px',
      },
    },
  },
  plugins: [],
};
export default config;
