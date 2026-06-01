import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#07080B",
        foreground: "#F7F8FA",
        muted: "#747B8C",
        border: "rgba(255,255,255,0.08)",
        surface: "#101218",
        accent: {
          mint: "#2FE6A6",
          cyan: "#66D9EF",
          amber: "#F7C948",
          coral: "#FF6B6B",
          violet: "#9B8CFF"
        }
      },
      borderRadius: {
        panel: "12px",
        card: "8px"
      },
      fontFamily: {
        sans: [
          "Inter",
          "Geist",
          "SF Pro Display",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
