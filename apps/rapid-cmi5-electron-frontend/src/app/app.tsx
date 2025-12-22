import { useEffect } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { setDividerColor, setIconColor, themeColor } from '@rapid-cmi5/ui';

/* Shared */
import AppHeader from './shared/AppHeader';

/* Branded */
import { SizingContextProvider, TimePickerProvider } from '@rapid-cmi5/ui';

import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from './styles/muiTheme';
import { darkTheme } from './styles/muiThemeDark';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { buildCmi5ZipParams, RapidCmi5 } from '@rapid-cmi5/react-editor';
import { MyScenariosForm } from './ScenarioSelection';
import { authToken, isAuthenticated } from '@rapid-cmi5/keycloak';
export default function App() {
  const dispatch = useDispatch();
  const theme = useSelector(themeColor);

  const isAuthenticatedSel = useSelector(isAuthenticated);
  const token = useSelector(authToken);

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
                        <RapidCmi5
                          authToken={token}
                          buildCmi5Zip={async (params: buildCmi5ZipParams) => {
                            return await DevopsApiClient.cmi5BuildBuild(
                              params.zipBlob,
                              params.zipName,
                              params.createAuMappings,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                                responseType: 'blob',
                              },
                            );
                          }}
                          GetScenariosForm={MyScenariosForm}
                        />
                      </main>
                    )}
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
