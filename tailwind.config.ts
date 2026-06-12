import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563EB", hover: "#1D4ED8", subtle: "#EFF6FF" },
        secondary: "#0E9F6E",
        accent: "#7C5CFC",
        risk: {
          low: "#0E9F6E",
          medium: "#D97706",
          high: "#DC2626",
          alert: "#B91C1C",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
}

export default config
