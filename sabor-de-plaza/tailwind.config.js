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
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.7s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.5s ease-out 0.7s both',
        'fade-in-up-delay-lg': 'fadeInUp 0.5s ease-out 1s both',
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
