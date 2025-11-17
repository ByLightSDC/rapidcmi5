import { useEffect, useState } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  lastAuthenticationSeconds,
  setlastAuthenticationSeconds,
} from './redux/globalReducer';
import {
  resetCommonIds,
  setDividerColor,
  setIconColor,
  themeColor,
} from '@rangeos-nx/ui/redux';

/* Shared */
import AppHeader from './shared/AppHeader';
import AppRoutes from './AppRoutes';

/* Hooks */
// import { isAuthenticated, authToken, auth } from '@rangeos-nx/ui/keycloak';
import { queryHooksConfig } from '@rangeos-nx/ui/api/hooks';

/* Branded */
import {
  BookmarksContextProvider,
  paginationFiltersConfig,
  SizingContextProvider,
  TimePickerProvider,
} from '@rangeos-nx/ui/branded';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from './styles/muiTheme';
import { darkTheme, dividerColor } from './styles/muiThemeDark';

// for using mui time picker library
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/* Layout Notes
App div has 2 columns: AppHeader and routed content below (Routes)
*/

// Only clear ids if time elapses
const elapsedTime = 28800; // 8 hours

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticatedSel = true;
  const token = 'test';
  const theme = useSelector(themeColor);
  const lastAuthenticationSecondsSel = useSelector(lastAuthenticationSeconds);
  const currentAuth = {
    parsedUserToken: {
      email: '',
    },
  };

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

  useEffect(() => {
    queryHooksConfig.headers.Authorization = token;
  }, [token]);

  useEffect(() => {
    paginationFiltersConfig.author = currentAuth?.parsedUserToken?.email;
  }, [currentAuth]);

  useEffect(() => {
    if (isAuthenticatedSel && token && token.length > 0) {
      const currentSeconds = new Date().getTime() / 1000;
      if (currentSeconds - lastAuthenticationSecondsSel > elapsedTime) {
        dispatch(resetCommonIds());
        dispatch(setlastAuthenticationSeconds(currentSeconds));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticatedSel]);

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
                    <BookmarksContextProvider>
                      <div
                        id="app-views"
                        // making overflow hidden will force this div to take remaining space of parent div
                        // and not allow any children to expand outside of it
                        style={{ width: '100%', overflow: 'hidden' }}
                      >
                       <AppHeader />
                        {isAuthenticatedSel && (
                          <main
                            id="app-routes"
                            style={{
                              display: 'flex',
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            <AppRoutes />
                          </main>
                        )}
                      </div>
                    </BookmarksContextProvider>
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
