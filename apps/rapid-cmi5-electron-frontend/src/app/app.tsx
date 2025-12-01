import { useEffect } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import {
  setDividerColor,
  setIconColor,
  themeColor,
} from '@rangeos-nx/ui/redux';

/* Shared */
import AppHeader from './shared/AppHeader';

/* Branded */
import {
  SizingContextProvider,
  TimePickerProvider,
} from '@rangeos-nx/ui/branded';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from './styles/muiTheme';
import { darkTheme } from './styles/muiThemeDark';

// for using mui time picker library
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { RapidCmi5Route } from '@rangeos-nx/rapid-cmi5';

/* Layout Notes
App div has 2 columns: AppHeader and routed content below (Routes)
*/

export default function App() {
  const dispatch = useDispatch();
  const theme = useSelector(themeColor);

  useEffect(() => {
    const iconColor =
      theme === 'dark'
        ? darkTheme.palette.primary.main
        : lightTheme.palette.primary.main;
    const dividerColor =
      theme === 'dark'
        ? darkTheme.input.outlineColor
        : lightTheme.input.outlineColor;
    dispatch(setIconColor(iconColor));
    dispatch(setDividerColor(dividerColor || 'grey'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <NotificationsProvider
            slotProps={{
              snackbar: {
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              },
            }}
          >
            <RouterWrapper>
              <Paper
                elevation={0}
                style={{ width: '100%', height: '100%', overflow: 'hidden' }}
              >
                <SizingContextProvider>
                  <TimePickerProvider>
                    <AppHeader />

                    <main
                      id="app-routes"
                      style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <RapidCmi5Route isElectron={true} />
                    </main>
                  </TimePickerProvider>
                </SizingContextProvider>
              </Paper>
            </RouterWrapper>
          </NotificationsProvider>
        </LocalizationProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}
