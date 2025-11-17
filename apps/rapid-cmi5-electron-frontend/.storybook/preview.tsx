// .storybook/preview.tsx
import '../src/styles.css';
import { ThemeProvider } from '@mui/material';
import { DecoratorFn } from '@storybook/react';

import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from '../src/app/styles/muiTheme';
import React from 'react';

const withTheme: DecoratorFn = (StoryFn) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline>
        <StoryFn />
      </CssBaseline>
    </ThemeProvider>
  );
};

// export all decorators that should be globally applied in an array
export const decorators = [withTheme];

export default {
  tags: ['autodocs', 'autodocs', 'autodocs'],
};

//layout for rendering components
/*export const parameters = {
  layout: 'centered',
};*/
