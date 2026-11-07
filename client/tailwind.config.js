/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f5',
          100: '#e3f2ec', // Badges, autollenado chip, pills
          200: '#c5e4d7',
          300: '#9ecfbd',
          400: '#5ba98f',
          500: '#34886f',
          600: '#236e59',
          700: '#1b5a49',
          800: '#144e40', // Main Dark Green from Figma wireframes
          900: '#0f3d32', // Hover state
          950: '#07241d',
        },
        accent: {
          yellow: '#f2ab27', // Golden-yellow scan brackets & Screen 5 active button
          yellowHover: '#e09a19',
          peach: '#fde5df', // Screen 7 error circle
          peachDot: '#f28f80',
        },
        surface: {
          bg: '#f6f8f5', // Warm cream/ivory background from Figma
          card: '#ffffff',
          scanner: '#181c1a', // Dark camera frame background
          mutedBtn: '#ded8cc', // Beige disabled buttons from Figma
          mutedText: '#787165',
          border: '#d5dbd3', // Crisp subtle border
          borderLight: '#e4eae2',
        },
        ink: {
          primary: '#141c18', // Near black with dark green undertone
          secondary: '#4e5650', // Body text
          muted: '#717b73', // Step indicators, helpers
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'phone': '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        'soft': '0 2px 8px -2px rgba(20, 28, 24, 0.06)',
      }
    },
  },
  plugins: [],
}
