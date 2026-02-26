import { useEffect } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import {
  setDividerColor,
  setIconColor,
  themeColor,
} from '@rapid-cmi5/ui';

/* Shared */
import AppHeader from './shared/AppHeader';

/* Branded */
import { SizingContextProvider, TimePickerProvider } from '@rapid-cmi5/ui';


/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { darkTheme } from './styles/muiThemeDark';
import { lightTheme } from './styles/muiTheme';
import UserConfig from './contexts/UserConfigContext';
import Auth from './contexts/AuthContext';
import { RapidCmi5Wrapper } from './RapidCmi5Wrapper';

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
        ? darkTheme.palette.primary.main
        : lightTheme.palette.primary.main;

    dispatch(setIconColor(iconColor));
    dispatch(setDividerColor(dividerColor || 'grey'));
  }, [dispatch, theme]);

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
                style={{
                  width: '100%',
                  height: '100vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <SizingContextProvider>
                  <TimePickerProvider>
                    <UserConfig>
                      <Auth>
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
                          <RapidCmi5Wrapper />
                        </main>
                      </Auth>
                    </UserConfig>
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
