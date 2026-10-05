/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'Cormorant Garamond', 'serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0a0908',
          800: '#141210',
          700: '#1e1b18',
          600: '#2a2622',
          500: '#3a3530',
        },
        ivory: {
          50: '#f5ede0',
          100: '#e8e2d8',
          200: '#d4ccbe',
          300: '#b8b0a0',
          400: '#9a9282',
          500: '#7a7268',
          600: '#5a5248',
        },
        gold: {
          400: '#d4a574',
          500: '#c9a96e',
          600: '#b8985a',
        },
        burgundy: {
          700: '#6b3a3a',
          600: '#7a4244',
          500: '#8a5052',
        },
      },
      letterSpacing: {
        'extra-wide': '0.3em',
      },
      transitionTimingFunction: {
        'smooth-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
