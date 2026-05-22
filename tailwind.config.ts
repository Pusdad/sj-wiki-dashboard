import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#14b8a6",
          navy: "#0f172a",
          slate: "#1e293b",
          card: "#1e293b",
          border: "#334155",
          muted: "#94a3b8",
        },
        bu: {
          corp: "#3b82f6",
          interconnect: "#0ea5e9",
          icc: "#8b5cf6",
          trek: "#a78bfa",
          dbr: "#f59e0b",
          europe: "#10b981",
          apac: "#06b6d4",
          unknown: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
