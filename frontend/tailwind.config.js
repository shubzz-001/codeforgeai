/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0d1117',
          surface: '#161b22',
          elevated:'#1c2128',
          overlay: '#21262d',
          hover:   '#30363d',
        },
        border: {
          subtle:   '#21262d',
          default:  '#30363d',
          emphasis: '#484f58',
        },
        text: {
          primary:   '#e6edf3',
          secondary: '#8b949e',
          muted:     '#484f58',
        },
        accent: {
          primary: '#58a6ff',
          cyan:    '#79c0ff',
          green:   '#3fb950',
          orange:  '#ffa657',
          red:     '#ff7b72',
          purple:  '#bc8cff',
          yellow:  '#e3b341',
        },
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        'fade-in':    'fadeIn 400ms ease both',
        'slide-left': 'slideInLeft 400ms ease both',
        'spin-slow':  'spin 2s linear infinite',
        shimmer:      'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(88, 166, 255, 0)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(88, 166, 255, 0.12)' },
        },
      },
      boxShadow: {
        glow:        '0 0 20px rgba(88, 166, 255, 0.2)',
        'glow-green':'0 0 20px rgba(63, 185, 80, 0.15)',
        card:        '0 8px 24px rgba(0, 0, 0, 0.3)',
        modal:       '0 32px 80px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}