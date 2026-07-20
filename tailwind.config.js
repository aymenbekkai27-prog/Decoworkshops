/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f0f5fb',
          100: '#d9e6f3',
          200: '#b3cce7',
          300: '#7da9d2',
          400: '#4a82b8',
          500: '#2d6094',
          600: '#1a365d',
          700: '#15294a',
          800: '#101f38',
          900: '#0a1526',
        },
        gold: {
          50: '#fdf9ef',
          100: '#faf0d7',
          200: '#f4dfa0',
          300: '#edc965',
          400: '#e3b13a',
          500: '#d4a02a',
          600: '#b07e1f',
          700: '#8a611b',
          800: '#6e4d1c',
          900: '#5a401c',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
