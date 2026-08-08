import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        yamo: {
          red:           '#E63927',
          'red-hover':   '#C92D1E',
          'red-light':   '#FDF0EE',
          mango:         '#F5A623',
          'mango-dark':  '#B26A00',
          'mango-light': '#FFF4E6',
          cream:         '#FDF8F2',
          ebony:         '#1A1A2E',
          fern:          '#27AE60',
          'fern-light':  '#EBF7EE',
          ash:           '#6B7280',
          fog:           '#E5E7EB',
          white:         '#FFFFFF',
          error:         '#C0392B',
        },
      },
      fontFamily: {
        sora:  ['var(--font-sora)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'yamo-card':  '16px',
        'yamo-pill':  '24px',
        'yamo-chip':  '8px',
        'yamo-input': '10px',
      },
      boxShadow: {
        'yamo-card': '0 2px 12px 0 rgba(26,26,46,0.08)',
        'yamo-nav':  '0 -1px 0 0 #E5E7EB',
      },
    },
  },
  plugins: [],
};

export default config;
