/** @type {import('tailwindcss').Config} */

// Every colour resolves to a CSS variable defined in src/index.css,
// so one class (e.g. `text-fg`) works in both light and dark themes.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        elevated: token('elevated'),
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
        },
        line: token('line'),
        accent: {
          DEFAULT: token('accent'),
          fg: token('accent-fg'),
        },
        ok: token('ok'),
        warn: token('warn'),
        bad: token('bad'),
        info: token('info'),
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        'instrument-serif': ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        // Instrument Serif display scale — tight leading, negative tracking.
        'display-2xl': ['clamp(4.75rem, min(11vw, 19vh), 13rem)', { lineHeight: '0.86', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(3.25rem, 7.5vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.6rem, 5vw, 5.25rem)', { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2.1rem, 3.4vw, 3.4rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.75rem, 2.4vw, 2.4rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
        'marquee-y': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(0,-50%,0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translate3d(0,6px,0)' },
          to: { opacity: '1', transform: 'translate3d(0,0,0)' },
        },
      },
      animation: {
        marquee: 'marquee 50s linear infinite',
        'marquee-y': 'marquee-y 18s linear infinite',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
