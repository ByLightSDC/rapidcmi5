// .storybook/preview.tsx
import '../src/lib/shared-styles.css';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { brandedTheme } from '../src/lib/styles/muiTheme';
import { brandedThemeDark } from '../src/lib/styles/muiThemeDark';

import { DecoratorFn, Preview } from '@storybook/react';
import { useMemo } from 'react';

/**
 * Declare a global theme with associated toolbar element
 */
export const globalTypes = {
  theme: {
    name: 'Theme',
    title: 'Theme',
    description: 'Theme for your components',
    defaultValue: 'light',
    toolbar: {
      dynamicTitle: true,
      items: [
        { value: 'light', left: '☀️', title: 'Light Mode' },
        { value: 'dark', left: '🌙', title: 'Dark Mode' },
      ],
    },
  },
};

const THEMES = {
  light: brandedTheme,
  dark: brandedThemeDark,
};

/**
 * Add a theme provider
 * @param Story
 * @param context
 * @returns
 */
export const withTheme: DecoratorFn = (Story, context) => {
  // The theme global we just declared
  const { theme: themeKey } = context.globals;

  const theme = useMemo(() => THEMES[themeKey] || THEMES['light'], [themeKey]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  );
};

/**
 * Set the Storybook Docs Background When Theme Changes
 * @param storyFn
 * @param context
 * @returns
 */
const withBackground: DecoratorFn = (storyFn, context) => {
  const { theme: themeKey } = context.globals;

  const theTheme = THEMES[themeKey];

  const el = document.getElementsByClassName('docs-story')[0];
  if (el) {
    el.style.background = theTheme.palette.background.paper;
  }
  return storyFn();
};

// export all decorators that should be globally applied in an array
export const decorators = [withTheme, withBackground];
export const tags = ['autodocs', 'autodocs', 'autodocs'];
