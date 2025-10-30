/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f6f6ed',
          100: '#e8e8d2',
          200: '#d3d2a8',
          300: '#bab877',
          400: '#a29f50',
          500: '#8a8640',
          600: '#6e6a35',
          700: '#57512d',
          800: '#494329',
          900: '#3f3a27',
        },
        agro: {
          green: '#10B981',
          brown: '#92400E',
          sky: '#3B82F6',
          soil: '#78350F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
