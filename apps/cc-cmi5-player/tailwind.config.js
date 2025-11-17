const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

// Modify your tailwind.config.js
const disabledCss = {
  'code::before': false,
  'code::after': false,
  'blockquote p:first-of-type::before': false,
  'blockquote p:last-of-type::after': false,
  pre: false,
  code: false,
  'pre code': false,
  'code::before': false,
  'code::after': false,
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      animation: {
        wiggle: 'wiggle 2s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'scale(0.95)', opacity: 0 },
          '50%': { transform: 'scale(1.08)', opacity: 0.75 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      typography: {
        DEFAULT: { css: disabledCss },
        sm: { css: disabledCss },
        lg: { css: disabledCss },
        xl: { css: disabledCss },
        '2xl': { css: disabledCss },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
