/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  '#fdf2f2',
          100: '#fae5e5',
          200: '#f2bfbf',
          300: '#e58888',
          400: '#c85656',
          500: '#a82020',
          600: '#841617',  // Oklahoma Crimson
          700: '#4E0002',  // Dark Crimson
          800: '#3a0001',
          900: '#280001',
        },
        warm: {
          50:  '#f7f7f7',
          100: '#f0f0f0',  // OU Light Gray
          200: '#e0e0e0',
          300: '#c8c8c8',
        },
      },
      fontFamily: {
        sans:      ['Barlow', 'Arial', 'sans-serif'],
        condensed: ['"Barlow Condensed"', '"Arial Narrow"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft':    '0 2px 12px 0 rgba(0,0,0,0.06)',
        'softer':  '0 1px 6px 0 rgba(0,0,0,0.04)',
        'medium':  '0 4px 20px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
