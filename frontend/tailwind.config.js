/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deepPurple: {
          50:  "#f5f2ff",
          100: "#ebe5ff",
          200: "#d4caff",
          300: "#b6a1ff",
          400: "#9570ff",
          500: "#7440ff",   // Primary mid‑tone
          600: "#5b2fd6",
          700: "#4623a8",
          800: "#32187a",
          900: "#1f0e4d",
          950: "#140933"    // Ultra‑deep accent
        }
      }
    },
  },
  plugins: [],
};
