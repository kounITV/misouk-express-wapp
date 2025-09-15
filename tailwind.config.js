/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Noto Sans Lao', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        'muted-foreground': '#818A91',
      },
    },
  },
  plugins: [],
};