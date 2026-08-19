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
        discord: {
          blurple: '#5865F2',
          'blurple-hover': '#4752C4',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          dark: '#1E1F22',
          darker: '#111214',
          card: '#2B2D31',
          hover: '#35373C',
          channel: '#80848E',
          text: '#DBDEE1',
          muted: '#949BA4'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Cairo"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"Cairo"', '"Tajawal"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
