/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        surfaceHigh: '#1e1e1e',
        border: '#2a2a2a',
        accent: '#3C9D48',
        accentHover: '#4ab856',
        accentDim: '#1e4d24',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0a0',
        textMuted: '#606060',
        danger: '#e05252',
        warning: '#e0a052',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.3)' },
        }
      }
    },
  },
  plugins: [],
}
