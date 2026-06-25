/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0d16',
          900: '#0f1320',
          800: '#161b2c',
          700: '#1f2638',
          600: '#2a3349',
        },
        accent: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        mint: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 8px 30px -10px rgba(99,102,241,0.35)',
      },
    },
  },
  plugins: [],
};
