import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 3sec Kitchen brand: deep red primary
        brand: {
          50: "#fff5f5",
          100: "#fde2e4",
          200: "#fab8bd",
          400: "#e84856",
          500: "#c8202f",
          600: "#a8121f",
          700: "#8b0000",
          900: "#3d0008",
        },
        // Gold/yellow accent from the chef-hat outline
        accent: {
          50: "#fffbe6",
          100: "#fff3b3",
          400: "#fbd34a",
          500: "#f8c72a",
          600: "#dca900",
          700: "#a07b00",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
