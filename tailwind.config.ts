import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      container: { center: true, padding: '1rem' },
      fontFamily: {
        sans: ['Vazirmatn','Tahoma','Arial','sans-serif']
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,.06)'
      }
    }
  },
  plugins: []
} satisfies Config;
