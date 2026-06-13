/** @type {import('tailwindcss').Config} */
const preset = require('@yourvivac/tailwind-preset').default;

module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), preset],
  theme: { extend: {} },
  plugins: [],
};
