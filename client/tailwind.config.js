/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#EAF3DE",
          100: "#C0DD97",
          200: "#97C459",
          400: "#639922",
          600: "#3B6D11",
          800: "#27500A",
          900: "#173404",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".8" },
        },
      },
    },
  },
  plugins: [],
};
