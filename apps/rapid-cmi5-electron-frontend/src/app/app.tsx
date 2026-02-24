import { useContext, useEffect } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import {
  debugLogError,
  setDividerColor,
  setIconColor,
  themeColor,
  useToaster,
} from '@rapid-cmi5/ui';

/* Shared */
import AppHeader from './shared/AppHeader';

/* Branded */
import { SizingContextProvider, TimePickerProvider } from '@rapid-cmi5/ui';

import {
  DevopsApiClient,
  overrideDevOpsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { GetScenarioFormProps, RapidCmi5 } from '@rapid-cmi5/react-editor';
import { MyScenariosForm } from './shared/modals/ScenarioSelection';
import {
  authError,
  authRefreshError,
  authToken,
  isAuthenticated,
} from '@rapid-cmi5/keycloak';
import { darkTheme } from './styles/muiThemeDark';
import { lightTheme } from './styles/muiTheme';
import { CourseAU, generateAuId } from '@rapid-cmi5/cmi5-build-common';
import UserConfig, { UserConfigContext } from './contexts/UserConfigContext';
import Auth, { AuthContext } from './contexts/AuthContext';

function RapidCmi5Wrapper() {
  const { token } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig } = useContext(UserConfigContext);

  console.log('git', gitUser, gitCredentials);
  overrideDevOpsApiClient(ssoConfig?.rangeRestApiUrl);
  const authRefreshErrorSel = useSelector(authRefreshError);
  const authErrorSel = useSelector(authError);
  const toaster = useToaster();

  const hasError = !!(authErrorSel.error || authRefreshErrorSel.error);
  const errorMessage = authErrorSel.error || authRefreshErrorSel.error;

  useEffect(() => {
    console.log('Has error toaster', errorMessage);

    toaster({
      message: `SSO Configuration Error: ${errorMessage}`,
      severity: 'error',
      autoHideDuration: 15
    });
  }, [hasError, errorMessage]);

  const getAuScenarioUUID = async (au: CourseAU) => {
    let scenarioUUID = null;

    if (au.rangeosScenarioUUID) {
      scenarioUUID = au.rangeosScenarioUUID;
    } else if (au.rangeosScenarioName) {
      const matchingScenarios = await DevopsApiClient.scenariosList(
        undefined,
        au.rangeosScenarioName,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        !matchingScenarios.data.data ||
        matchingScenarios.data.totalCount === 0
      ) {
        debugLogError(`No matching scenario found for AU "${au.auName}"`);
        return null;
      }

      scenarioUUID = matchingScenarios.data.data?.at(0)?.uuid;
    }
    return scenarioUUID;
  };

  return (
    <>
 <h2>my token : {token}</h2>
 <h2>errors : {errorMessage}</h2>

    <RapidCmi5
      showHomeButton={true}
      userAuth={{
        token,
        userEmail: gitUser?.authorEmail || '',
        userName: gitUser?.authorName || '',
        gitCredentials,
      }}
      downloadCmi5Player={async () => {
        const response = await fetch('/assets/cc-cmi5-player.zip');
        return response;
      }}
      processAu={async (au: CourseAU, blockId: string) => {
        const scenarioUUID = await getAuScenarioUUID(au);

        if (!scenarioUUID) return;

        const auId = generateAuId({ blockId, auName: au.auName });
        let cmi5CourseMapping;
        try {
          cmi5CourseMapping = await DevopsApiClient.cmi5AuMappingRetrieve(
            auId,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (err: any) {
          if (err.status !== 404) {
            throw err;
          }
        }

        // update if mapping exists
        if (cmi5CourseMapping) {
          try {
            await DevopsApiClient.cmi5AuMappingUpdate(
              auId,
              {
                scenarios: [scenarioUUID],
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          } catch (err) {
            debugLogError(`Could not update au mapping for auId: ${auId}`);
            throw err;
          }
        }
        // create if mapping does not
        else {
          try {
            await DevopsApiClient.cmi5AuMappingCreate(
              {
                auId,
                scenarios: [scenarioUUID],
                name: 'test',
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          } catch (err) {
            debugLogError(`Could not create au mapping for auId: ${auId}`);
            throw err;
          }
        }
      }}
      GetScenariosForm={
        token
          ? (props: GetScenarioFormProps) => (
              <MyScenariosForm
                token={token}
                submitForm={props.submitForm}
                formType={props.formType}
                errors={props.errors}
                formMethods={props.formMethods}
                url={ssoConfig?.rangeRestApiUrl}
              />
            )
          : undefined
      }
    />
        </>
  );
}

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
