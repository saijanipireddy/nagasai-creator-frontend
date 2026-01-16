/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f0f',
          card: '#1a1a2e',
          sidebar: '#16213e',
          accent: '#e94560',
          secondary: '#0f3460',
          text: '#eaeaea',
          muted: '#a0a0a0',
        }
      }
    },
  },
  plugins: [],
}
