/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dce7f3',
          600: '#2c5282',
          700: '#1e3a5f',
          800: '#162d4a',
          900: '#0f1e33',
        },
      },
    },
  },
  plugins: [],
}
