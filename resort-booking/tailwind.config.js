/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb brand colors
        'airbnb-red': '#FF385C',
        'airbnb-red-dark': '#E51E53',
        'airbnb-red-light': '#FF5A5F',
        'airbnb-rausch': '#FD5861',
        'airbnb-babu': '#00A699',
        'airbnb-arches': '#FC642D',
        'airbnb-hof': '#484848',
        'airbnb-foggy': '#767676',
        'gray-50': '#F9FAFB',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-300': '#D1D5DB',
        'gray-400': '#9CA3AF',
        'gray-500': '#6B7280',
        'gray-600': '#4B5563',
        'gray-700': '#374151',
        'gray-800': '#1F2937',
        'gray-900': '#111827',
      },
      fontFamily: {
        sans: [
          'Cormorant Garamond',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        ui: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'Anton',
          'Impact',
          'Haettenschweiler',
          'Arial Narrow Bold',
          'sans-serif',
        ],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '4rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.18)',
        'card-hover': '0 8px 25px rgba(0,0,0,0.15)',
        'floating': '0 16px 40px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'nav-pop': 'navPop 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) forwards',
        'nav-icon-hover': 'navIconHover 0.45s cubic-bezier(0.34, 1.45, 0.64, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        navPop: {
          '0%': { opacity: '0', transform: 'translateY(-14px) scale(0.6)' },
          '65%': { opacity: '1', transform: 'translateY(4px) scale(1.12)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        navIconHover: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '35%': { transform: 'scale(1.18) rotate(-8deg) translateY(-5px)' },
          '65%': { transform: 'scale(1.12) rotate(6deg) translateY(-3px)' },
          '100%': { transform: 'scale(1.15) rotate(0deg) translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
} 