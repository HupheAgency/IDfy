import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette (mapped from old dark → new light)
        black:  "#F7F6F3",   // primary background (warm off-white)
        white:  "#111111",   // primary text (near-black)
        accent: "#3B6B4A",   // forest green
        grey:   "#FFFFFF",   // card surface
        dark:   "#E5E3DC",   // borders
        mid:    "#999999",   // secondary text
        // New explicit tokens
        ink:        "#111111",   // for dark CTA sections / dark buttons text
        "bg-main":  "#F7F6F3",
        "bg-card":  "#FFFFFF",
        "accent-lt":  "#EEF5F0",
        "accent-mid": "#7BC98A",
        "text-light": "#CCCCCC",
        "canvas-dark": "#111111", // dark CTA section background
      },
      fontFamily: {
        syne:  ["Syne", "sans-serif"],
        sans:  ["DM Sans", "sans-serif"],
        mono:  ["DM Mono", "monospace"],
      },
      borderRadius: {
        pill: "100px",
        card: "16px",
      },
      animation: {
        "ticker":   "ticker 30s linear infinite",
        "fade-up":  "fadeUp 0.7s ease-out forwards",
        "fade-in":  "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
