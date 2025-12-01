import { render } from '@testing-library/react';

import { ThemeProvider } from '@mui/material';
import { lightTheme } from '../../../styles/muiTheme';

import DashboardCard from '../DashboardCard';

describe('DashboardCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ThemeProvider theme={lightTheme}>
        <DashboardCard name="My Dashboard Card" index={0} />
      </ThemeProvider>,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should have Card Name', () => {
    const { getByText } = render(
      <ThemeProvider theme={lightTheme}>
        <DashboardCard name="My Dashboard Card" index={0} />
      </ThemeProvider>,
    );

    expect(getByText(/My Dashboard Card/i)).toBeTruthy();
  });

  it('should should match snapshot', () => {
    const { asFragment } = render(
      <ThemeProvider theme={lightTheme}>
        <DashboardCard name="My Dashboard Card" index={0} />
      </ThemeProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display children if passed', () => {
    const { getByText } = render(
      <ThemeProvider theme={lightTheme}>
        <DashboardCard name="My Dashboard Card" index={0}>
          <div>My Card Children</div>
        </DashboardCard>
      </ThemeProvider>,
    );

    expect(getByText(/My Card Children/i)).toBeTruthy();
  });
});
