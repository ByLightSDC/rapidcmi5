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

import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  buildCmi5ZipParams,
  GetScenarioFormProps,
  RapidCmi5,
} from '@rapid-cmi5/react-editor';
import { MyScenariosForm } from './ScenarioSelection';
import { authToken, isAuthenticated } from '@rapid-cmi5/keycloak';
import { darkTheme } from './styles/muiThemeDark';
import { lightTheme } from './styles/muiTheme';

function RapidCmi5WithAuth({
  isAuthenticated,
  token,
}: {
  isAuthenticated: boolean;
  token: string | undefined;
}) {
  console.log(isAuthenticated, token);
  if (!token) return null;
  return (
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
      GetScenariosForm={(props: GetScenarioFormProps) => (
        <MyScenariosForm token={token} submitForm={props.submitForm} />
      )}
    />
  );
}

export default function App({ authEnabled }: { authEnabled: boolean }) {
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
        ? darkTheme.palette.primary.main
        : lightTheme.palette.primary.main;
    // theme === 'dark'
    //   ? darkTheme.typography.outlineColor
    //   : lightTheme.typography.outlineColor;
    dispatch(setIconColor(iconColor));
    dispatch(setDividerColor(dividerColor || 'grey'));
    console.log('Theme chanbge', theme);
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

                    <main
                      id="app-routes"
                      style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      {authEnabled ? (
                        <RapidCmi5WithAuth
                          isAuthenticated={isAuthenticatedSel}
                          token={token}
                        />
                      ) : (
                        <RapidCmi5 />
                      )}
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
