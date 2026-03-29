/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        tablet: "860px",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        card: "1.5rem",
        panel: "1.9rem",
      },
      colors: {
        ink: { 950: "#0c0f14", 900: "#141922", 800: "#1e2430", 700: "#2a3140" },
        mist: { 100: "#e8ecf4", 200: "#d1d8e6", 300: "#a8b4cc" },
        sea: { 400: "#5b8cff", 500: "#3d6ef5", 600: "#2d56d6" },
        coral: { 400: "#ff8a7a", 500: "#ff6b5b" },
        sage: { 400: "#7bc9a4", 500: "#5ab88a" },
      },
      boxShadow: {
        soft: "0 8px 32px rgba(12, 15, 20, 0.12)",
        nav: "0 -4px 24px rgba(12, 15, 20, 0.08)",
        panel: "0 18px 42px rgba(16, 23, 40, 0.14)",
        float: "0 14px 30px rgba(16, 23, 40, 0.16)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
