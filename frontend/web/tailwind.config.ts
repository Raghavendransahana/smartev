import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color: #00403C and its variations
        primary: {
          50: '#f0f9f8',   // Very light tint
          100: '#ccebe8',  // Light tint
          200: '#99d6d0',  // Lighter
          300: '#66c2b8',  // Light
          400: '#33ada0',  // Medium light
          500: '#00403C',  // Base color
          600: '#003933',  // Medium dark
          700: '#00322a',  // Dark
          800: '#002b21',  // Darker
          900: '#002419',  // Very dark
          950: '#001d10',  // Darkest
        },
        // Neutral grays for text and backgrounds
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Success, warning, error states using primary hue variations
        success: {
          50: '#f0f9f8',
          500: '#00403C',
          600: '#003933',
        },
        warning: {
          50: '#fefdf0',
          500: '#8b7355',
          600: '#705d44',
        },
        error: {
          50: '#fef2f2',
          500: '#7c3333',
          600: '#672929',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '112': '28rem',   // 448px
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 64, 60, 0.1), 0 4px 6px -2px rgba(0, 64, 60, 0.05)',
        'medium': '0 4px 25px -5px rgba(0, 64, 60, 0.1), 0 10px 10px -5px rgba(0, 64, 60, 0.04)',
        'large': '0 10px 40px -12px rgba(0, 64, 60, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}

export default config