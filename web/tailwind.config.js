/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      backgroundColor: ['disabled']
    },
  },
  plugins: [],
  darkMode: 'class'
}
