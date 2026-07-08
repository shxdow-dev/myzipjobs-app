/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        orange: "#F2661D",
        orangeDark: "#D6551A",
        orangeLight: "#FCE4D6",
        teal: "#0F766E",
        tealLight: "#D9F2EF",
        warmWhite: "#FFF8F0",
        charcoal: "#2B2620",
        charcoalMuted: "#6B6259",
        success: "#3A7D44",
        alert: "#D64545",
      },
      fontFamily: {
        heading: ["Baloo 2", "cursive"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

