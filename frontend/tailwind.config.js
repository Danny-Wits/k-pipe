/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kpipe-red': '#e11d48',
        'kpipe-darkred': '#be123c',
        'kpipe-black': '#0a0a0a',
        'kpipe-gray': '#71717a',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans: ['"Space Grotesk"', '-apple-system', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
