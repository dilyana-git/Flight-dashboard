/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0e17',
          900: '#0d1220',
          800: '#111827',
          700: '#1a2235',
          600: '#243047',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        slate: {
          200: '#e2e8f0',
          500: '#64748b',
        },
        wizz: '#8b5cf6',
        ryanair: '#f59e0b',
        easyjet: '#f97316',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
