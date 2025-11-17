import { render } from '@testing-library/react';
import { brandedTheme } from '../../styles/muiTheme';
import { ButtonMainUi } from './buttons';
import { ThemeProvider } from '@mui/material';

describe('Buttons', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={brandedTheme}>
        <ButtonMainUi />
      </ThemeProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
