/**
 * Tailwind CSS configuration for the Mehmaan Restaurant SaaS.
 *
 * This config builds on the existing design tokens defined in
 * `src/design/theme.ts` and provides a light/dark class‑based theme.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class based dark mode (e.g. data-theme="dark")
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // Semantic palette – map to Tailwind's built‑in palettes.
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        secondary: {
          50: '#f5f6f7',
          100: '#e0e2e4',
          200: '#c3c7ca',
          300: '#a4a9ad',
          400: '#777d82',
          500: '#53585d',
          600: '#34383c',
          700: '#222528',
          800: '#111315',
          900: '#090a0b',
        },
        // Additional semantic colors can be added (success, danger, warning, etc.)
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem', // 2 px
        md: '0.25rem',  // 4 px
        lg: '0.5rem',   // 8 px
        xl: '0.75rem',  // 12 px
        full: '9999px',
      },
      spacing: {
        // Multiples of 4 px (Tailwind base = 0.25rem)
        1: '0.25rem', // 4 px
        2: '0.5rem',  // 8 px
        3: '0.75rem', // 12 px
        4: '1rem',    // 16 px
        5: '1.25rem', // 20 px
        6: '1.5rem',  // 24 px
        8: '2rem',    // 32 px
        10: '2.5rem', // 40 px
        12: '3rem',   // 48 px
        16: '4rem',   // 64 px
        20: '5rem',   // 80 px
        24: '6rem',   // 96 px
        32: '8rem',   // 128 px
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
