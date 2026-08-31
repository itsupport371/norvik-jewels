import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFFFF',
        paper: '#FFFFFF',
        ink: '#0B1626',
        charcoal: '#1B2A3D',
        muted: '#6B7280',
        line: '#E2DFD6',
        linestrong: '#C9C4B4',
        gold: '#B8935A',

        // ---- NORVIK JEWELS locked palette (Developer UI Handoff, Aug 2026) ----
        // Commerce sections stay light (scandi/softwhite), brand-story sections
        // stay dark (midnight/deepmidnight). Gold stays a restrained accent.
        midnight: '#091528', // Primary dark — hero, essence, storytelling, dark strips
        deepmidnight: '#050812', // Deepest dark — footer, overlays
        scandi: '#FFFFFF', // Primary light — header, category, product grids, PDP
        softwhite: '#FCFBF9', // Product surface — image tiles, cards, forms
        antiquegold: '#B48851', // Primary accent — labels, thin lines, arrows, small CTAs
        champagnegold: '#CFA772', // Highlight accent — premium highlights / selected icons
        warmstone: '#E0D8CF', // Divider/border — 1px rules
        inknavy: '#161D2D', // Dark text — headlines, nav, product info on ivory
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
