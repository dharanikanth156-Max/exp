/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soil:   { DEFAULT: '#152318', 900: '#0e1810', 800: '#152318', 700: '#1d301f' },
        harvest: { DEFAULT: '#D9A441', 600: '#C08A2C', 500: '#D9A441', 400: '#E6BC6A' },
        clay:   { DEFAULT: '#BF5B3D', 600: '#A84A2F' },
        cream:  '#FBF6EC',
        leaf:   { DEFAULT: '#4C7A4F', 600: '#3E6540' }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif']
      },
      boxShadow: {
        crate: '0 6px 0 0 rgba(21,35,24,0.12), 0 10px 24px -8px rgba(21,35,24,0.35)'
      }
    },
  },
  plugins: [],
};
