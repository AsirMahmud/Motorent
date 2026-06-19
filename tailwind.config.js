/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11142d",
        brand: {
          50: "#eef8ff",
          100: "#d9f3ff",
          300: "#52b4da",
          500: "#2c82bb",
          700: "#22458f",
          800: "#1e3e85",
          900: "#183774",
        },
      },
      boxShadow: {
        soft: "14px 41px 100px rgba(49, 89, 211, 0.12)",
        lift: "14px 10px 30px rgba(49, 89, 211, 0.12)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
