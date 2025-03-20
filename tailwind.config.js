/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF3B30',
          dark: '#CC2E26',
          light: '#FF5147',
        },
        secondary: {
          DEFAULT: '#121212',
          light: '#1E1E1E',
          dark: '#0A0A0A',
        },
        neutral: {
          DEFAULT: '#1A1A1A',
          dark: '#141414',
          darker: '#0F0F0F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};