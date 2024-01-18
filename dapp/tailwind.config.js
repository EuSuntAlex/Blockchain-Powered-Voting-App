/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif']
      },
      backgroundImage: {
        'mvx-white': "url('../multiversx-white.svg')",
        'endless-background': "url('/endless-constellation.svg')"
      }
    },
  },
  plugins: []
};
