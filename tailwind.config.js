/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'from-blue-500', 'to-blue-600',
    'from-green-500', 'to-green-600',
    'from-purple-500', 'to-purple-600',
    'from-orange-500', 'to-orange-600',
    'from-red-500', 'to-red-600',
    'from-pink-500', 'to-pink-600',
    'from-indigo-500', 'to-indigo-600',
    'from-teal-500', 'to-teal-600',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
