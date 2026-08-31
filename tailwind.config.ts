import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF0EC",
        surface: "#FFFFFF",
        sunken: "#E5E8E1",
        ink: "#171B21",
        "ink-soft": "#5B6058",
        "ink-faint": "#8B9086",
        line: "#DCDFD9",
        navy: "#12151C",
        "navy-surface": "#1A1F29",
        "navy-line": "#2B3140",
        "navy-ink": "#F3F4F1",
        "navy-ink-soft": "#9AA1B0",
        brand: {
          DEFAULT: "#E83330",
          deep: "#BE201F",
          wash: "#FCE6E5",
        },
        good: "#1F8A54",
        warn: "#B7791E",
        bad: "#C4341F",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,27,33,0.04), 0 8px 24px -12px rgba(23,27,33,0.10)",
        navy: "0 1px 2px rgba(0,0,0,0.3), 0 12px 28px -12px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "perf-h": "radial-gradient(circle, var(--perf-color) 2.5px, transparent 2.6px)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pop": { "0%": { transform: "scale(0.96)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up .4s ease both",
        "pop": "pop .18s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
