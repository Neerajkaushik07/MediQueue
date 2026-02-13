/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
      colors:{
        'primary': '#0891b2',
        'primary-dark': '#0e7490',
        'primary-light': '#06b6d4',
        'secondary': '#14b8a6',
        'accent': '#10b981',
        'medical-blue': '#0891b2',
        'medical-teal': '#14b8a6',
        'medical-green': '#10b981',
        'trust-blue': '#0369a1',
        'calm-blue': '#e0f2fe',
        'care-green': '#d1fae5',
        'neutral-warm': '#f8fafc',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
        'gradient-trust': 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)',
        'gradient-calm': 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
        'gradient-care': 'linear-gradient(to bottom, #ecfdf5, #d1fae5)',
        'pattern-medical': 'radial-gradient(circle at 2px 2px, #e0f2fe 1px, transparent 0)',
        'pattern-dots': 'radial-gradient(circle, #e0f2fe 1px, transparent 1px)',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(8, 145, 178, 0.15)',
        'medical': '0 4px 16px rgba(8, 145, 178, 0.12)',
        'trust': '0 10px 40px rgba(3, 105, 161, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-gentle': 'pulseGentle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}