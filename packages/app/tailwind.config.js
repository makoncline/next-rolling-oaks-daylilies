/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ro: {
          bg: "#1b2733",
          surface: "#222d38",
          surface2: "#28323e",
          text: "#aaabad",
          "text-high": "#ece9e6",
          blue: "#1f78d1",
          violet: "#7c3aed",
          danger: "#ef4444",
          success: "#22c55e",
          info: "#eab308",
        },
      },
      maxWidth: {
        content: "46rem",
      },
    },
  },
  plugins: [],
};
