/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aicare: {
          navy: '#082847',
          blue: '#0B3D6E',
          teal: '#0D9488',
          cyan: '#06B6D4',
          gray: '#8B9AAB',
          surface: '#F4F7FA',
          azure: '#0284C7',
        },
        primary: {
          DEFAULT: '#0B3D6E',
          foreground: '#ffffff',
          hover: '#082847',
        },
        accent: {
          DEFAULT: '#0D9488',
          foreground: '#ffffff',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        muted: {
          DEFAULT: '#F4F7FA',
          foreground: '#8B9AAB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        aicare: '12px',
      },
      boxShadow: {
        aicare: '0 4px 24px rgba(8, 40, 71, 0.08)',
        'aicare-lg': '0 8px 40px rgba(8, 40, 71, 0.12)',
        glass: '0 8px 32px rgba(11, 61, 110, 0.15)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.25s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 148, 136, 0.35)' },
          '50%': { boxShadow: '0 0 0 12px rgba(13, 148, 136, 0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
