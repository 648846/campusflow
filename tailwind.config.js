/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
        dark: '#0f172a',
        darkLighter: '#1e293b',
        light: '#f8fafc'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)'
      }
    }
  },
  safelist: [
    { pattern: /(from|to|via)-(primary|secondary|accent|success|danger|blue|indigo|purple|violet|amber|orange|emerald|green|teal|cyan|sky|rose|pink|red|yellow)-(400|500|600|700)/ }
  ],
  plugins: []
};
