/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'billabong': ['"billabong"', 'serif'],
      'helveticaNeue': ['"HelveticaNeue"', 'sans-serif'],
      'Turpis': ['"Turpis"', 'sans-serif'],
      'Roboto': ['"Roboto"', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}