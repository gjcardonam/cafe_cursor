/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#059669',
          600: '#059669',
        },
        accent: {
          DEFAULT: '#F97316',
          500: '#F97316',
        },
      },
    },
  },
  plugins: [],
}
