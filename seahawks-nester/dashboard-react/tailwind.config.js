/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'seahawks-blue': '#002244',
        'seahawks-green': '#69BE28',
        'seahawks-navy': '#001433',
      }
    },
  },
  plugins: [],
}
