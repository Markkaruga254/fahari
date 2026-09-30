import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0E0F0C",
        sand: "#F3EBDD",
        "sand-muted": "#9A988D",
        "savanna-amber": "#F2A900",
        "baobab-green": "#2F6B4F",
        terracotta: "#C4572E",
        "surface-card": "#181B15",
        "surface-elevated": "#151713",
        "border-subtle": "#232620",
        "border-strong": "#2A2D26",
        primary: "#F2A900",
        "primary-container": "#F2A900",
        secondary: "#2F6B4F",
        "secondary-container": "#1B3B2B",
        tertiary: "#C4572E",
        "tertiary-container": "#ff9e7c",
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        // CSS variables are provided by next/font in the fonts step.
        // System-store fallbacks keep headings readable until then.
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        headline: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        editorial: ["var(--font-editorial)", "Newsreader", "serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float1: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(0.8deg)" },
        },
        float2: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(-1.2deg)" },
        },
        float3: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
      },
      animation: {
        marquee: "marquee 34s linear infinite",
        float1: "float1 7s ease-in-out infinite",
        float2: "float2 8.5s ease-in-out infinite",
        float3: "float3 6.5s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
