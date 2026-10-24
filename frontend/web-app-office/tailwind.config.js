/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tnnavy: {
          50: '#f0f5fa',
          100: '#dce8f4',
          200: '#bcd3e9',
          300: '#8eb8da',
          400: '#5a97c6',
          500: '#387bb2',
          600: '#276295',
          700: '#1f4e78',
          800: '#1c4264',
          900: '#0f2742',
          950: '#0a1a2e',
        },
        tnmaritime: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        tngold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        tngreen: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(15, 39, 66, 0.08), 0 1px 2px -1px rgba(15, 39, 66, 0.04)',
        'gov-md': '0 4px 6px -1px rgba(15, 39, 66, 0.08), 0 2px 4px -2px rgba(15, 39, 66, 0.04)',
        'gov-lg': '0 10px 15px -3px rgba(15, 39, 66, 0.1), 0 4px 6px -4px rgba(15, 39, 66, 0.05)',
      }
    },
  },
  plugins: [],
}
