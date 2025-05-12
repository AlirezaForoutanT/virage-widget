// tailwind.config.ts
import { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import animatePlugin from 'tailwindcss-animate'
import scrollbarPlugin from 'tailwind-scrollbar'

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [
    animatePlugin,
    scrollbarPlugin({ nocompatible: false }),
    
  ],
}

export default config
