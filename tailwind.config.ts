
import type { Config } from "tailwindcss";
import { themeExtensions } from "./src/styles/tailwind/theme";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: themeExtensions,
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
