import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary black variants
        ink: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1a1a26',
          700: '#22223a',
          600: '#2a2a45',
        },
        brand: {
          red: '#e8001c',
          'red-2': '#ff1a35',
          'red-3': '#ff4d63',
          blue: '#0055ff',
          'blue-2': '#1a6aff',
          'blue-3': '#4d8eff',
          yellow: '#ffd600',
          'yellow-2': '#ffe033',
          pink: '#ff2d78',
          'pink-2': '#ff5599',
        },
        muted: '#8888aa',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans: ['IBM Plex Sans Thai', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
