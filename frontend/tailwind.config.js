/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf3',
          100: '#ddf4e8',
          200: '#b9e8d0',
          300: '#8ad6b0',
          400: '#4db98a',
          500: '#16834A',
          600: '#146B3A',
          700: '#0f572f',
          800: '#0c4426',
          900: '#0a371f',
        },
        dark: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.85rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(2,6,23,0.06), 0 4px 16px rgba(2,6,23,0.05)',
        lift: '0 8px 30px rgba(2,6,23,0.12)',
      },
    },
  },
  plugins: [],
};