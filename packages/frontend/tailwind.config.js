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
        // Kahoot-inspired vibrant, accessible color palette
        primary: {
          DEFAULT: '#46178F',  // Deep purple
          light: '#6938A5',
          dark: '#2D0E5A',
        },
        secondary: {
          DEFAULT: '#E21B3C',  // Vibrant red
          light: '#FF4560',
          dark: '#B31530',
        },
        accent: {
          blue: '#1368CE',     // Bright blue
          orange: '#FF8C1A',   // Energetic orange
          green: '#26890D',    // Fresh green
          yellow: '#FFD602',   // Bright yellow
        },
        success: '#26890D',
        danger: '#E21B3C',
        warning: '#FF8C1A',
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
