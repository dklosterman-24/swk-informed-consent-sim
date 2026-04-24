/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#f2f7f5',
          100: '#daeee7',
          200: '#b5dcd0',
          300: '#85c3b0',
          400: '#54a68f',
          500: '#3a8a74',
          600: '#2d6a5a',
          700: '#235446',
          800: '#1b3f35',
          900: '#142e26',
        },
        warm: {
          50:  '#faf9f7',
          100: '#f3f0eb',
          200: '#e8e0d5',
          300: '#d5c9b8',
        },
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
