/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#f97316',
          rose: '#f43f5e',
          yellow: '#eab308',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-up': 'scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-up': {
          from: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'slide-in': {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
