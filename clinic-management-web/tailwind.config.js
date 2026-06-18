/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aicare: {
          navy: '#0c4a6e',
          blue: '#0369a1',
          teal: '#0d9488',
          emerald: '#059669',
          cyan: '#06b6d4',
          violet: '#7c3aed',
          rose: '#e11d48',
          amber: '#d97706',
          gray: '#64748b',
          surface: '#f0f9ff',
          azure: '#0284c7',
        },
        primary: {
          DEFAULT: '#0369a1',
          foreground: '#ffffff',
          hover: '#0c4a6e',
        },
        accent: {
          DEFAULT: '#0d9488',
          foreground: '#ffffff',
        },
        success: '#059669',
        warning: '#d97706',
        danger: '#e11d48',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        aicare: '14px',
      },
      boxShadow: {
        aicare: '0 4px 24px rgba(3, 105, 161, 0.08)',
        'aicare-lg': '0 12px 48px rgba(3, 105, 161, 0.14)',
        glass: '0 8px 32px rgba(13, 148, 136, 0.18)',
        glow: '0 0 24px rgba(13, 148, 136, 0.35)',
        'glow-blue': '0 0 24px rgba(3, 105, 161, 0.35)',
        card: '0 2px 16px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        'card-hover': '0 8px 32px rgba(13, 148, 136, 0.12), 0 0 0 1px rgba(13, 148, 136, 0.15)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0369a1 0%, #0d9488 50%, #06b6d4 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(3,105,161,0.12) 0%, rgba(13,148,136,0.12) 50%, rgba(6,182,212,0.08) 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(13,148,136,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(3,105,161,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(124,58,237,0.08) 0px, transparent 50%)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 148, 136, 0.4)' },
          '50%': { boxShadow: '0 0 0 14px rgba(13, 148, 136, 0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
