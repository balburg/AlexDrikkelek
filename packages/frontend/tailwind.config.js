/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors using CSS custom properties
        primary: {
          DEFAULT: 'var(--color-primary, #46178F)',
          light: 'var(--color-primary-light, #6938A5)',
          dark: 'var(--color-primary-dark, #2D0E5A)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #E21B3C)',
          light: 'var(--color-secondary-light, #FF4560)',
          dark: 'var(--color-secondary-dark, #B31530)',
        },
        accent: {
          blue: 'var(--color-accent-blue, #1368CE)',
          orange: 'var(--color-accent-orange, #FF8C1A)',
          green: 'var(--color-accent-green, #26890D)',
          yellow: 'var(--color-accent-yellow, #FFD602)',
        },
        success: 'var(--color-accent-green, #26890D)',
        danger: 'var(--color-secondary, #E21B3C)',
        warning: 'var(--color-accent-orange, #FF8C1A)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'game': '0 8px 0 0 rgba(0,0,0,0.2)',
        'game-hover': '0 6px 0 0 rgba(0,0,0,0.2)',
        'game-active': '0 2px 0 0 rgba(0,0,0,0.2)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
