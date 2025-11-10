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
        // Accessibility: Color-blind friendly palette
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004499',
        },
        secondary: {
          DEFAULT: '#FFB000',
          dark: '#CC8C00',
        },
        success: '#00AA00',
        danger: '#DD0000',
        warning: '#FF8800',
      },
    },
  },
  plugins: [],
}
