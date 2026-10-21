/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hud-black': '#07090e',
        'hud-panel': '#0d111a',
        'hud-elevated': '#131926',
        'hud-card': '#182030',
        'linux-cyan': '#00E5FF',
        'linux-green': '#00E676',
        'linux-amber': '#FFB300',
        'linux-crimson': '#FF1744',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
