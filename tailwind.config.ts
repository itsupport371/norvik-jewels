import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F6F3EE',
        paper: '#F6F3EE',
        ink: '#0B1626',
        charcoal: '#1B2A3D',
        muted: '#6B7280',
        line: '#E2DFD6',
        linestrong: '#C9C4B4',
        gold: '#B8935A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      letterSpacing: {
        wide2: '0.04em',
        wide3: '0.08em',
      },
    },
  },
  plugins: [],
};

export default config;
