/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8ef',
          100: '#faefd8',
          200: '#f4dca9',
          300: '#ecc272',
          400: '#e3a341',
          500: '#d4882a',
          600: '#b86d1f',
          700: '#97531d',
          800: '#7a431f',
          900: '#64381d',
        },
        hotel: {
          dark: '#0c0c0e',
          darker: '#08080a',
          card: '#13131a',
          border: '#1e1e2a',
          muted: '#6b7280',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
};
