/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'legend-black': '#070708',
        'legend-deep': '#121214',
        'legend-ink': '#1C1C21',
        'legend-smoke': '#2A2624',
        'legend-brass': '#8B6B3F',
        'legend-gold': '#C6A96B',
        'legend-gold-bright': '#E4C98A',
        'legend-wenge': '#3B2F2F',
        'legend-light': '#F5F5F5',
      },
      backgroundImage: {
        'legend-mesh':
          'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(198, 169, 107, 0.12) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 100% 100%, rgba(139, 107, 63, 0.08) 0%, transparent 45%), radial-gradient(ellipse 60% 40% at 0% 80%, rgba(59, 47, 47, 0.35) 0%, transparent 40%)',
        'legend-card-shine':
          'linear-gradient(135deg, rgba(198, 169, 107, 0.15) 0%, transparent 42%, transparent 58%, rgba(198, 169, 107, 0.06) 100%)',
      },
      boxShadow: {
        'legend-soft': '0 4px 24px rgba(0, 0, 0, 0.45)',
        'legend-glow': '0 0 40px rgba(198, 169, 107, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'legend-nav': '0 -8px 32px rgba(0, 0, 0, 0.55)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(198, 169, 107, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(198, 169, 107, 0.5)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
