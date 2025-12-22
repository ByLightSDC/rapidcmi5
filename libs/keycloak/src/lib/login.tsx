import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useDispatch, useSelector } from 'react-redux';
import { config, ModalDialog } from '@rapid-cmi5/ui';

import Box from '@mui/material/Box';
import {
  authError,
  authRefreshError,
  setAuth,
  setAuthToken,
  setAuthIdToken,
  setIsAuthenticated,
} from './reducer';

/* Blocks UI when not authenticated */

export interface LoginProps {
  scope: string;
  children: JSX.Element;
}

export function Login(props: LoginProps) {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useDispatch();
  const keyCloakErr = useSelector(authError);
  const authRefreshErrorSel = useSelector(authRefreshError);

  React.useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        // handy for inspecting all of the authenticated user's properties

        let roles: string[] = [];
        if (
          keycloak.resourceAccess &&
          keycloak.resourceAccess.hasOwnProperty(config.KEYCLOAK_CLIENT_ID)
        ) {
          roles = keycloak.resourceAccess[config.KEYCLOAK_CLIENT_ID].roles;
        }

        dispatch(
          setAuth({
            username: keycloak.tokenParsed
              ? ((keycloak.tokenParsed['name'] ||
                  keycloak.tokenParsed['preferred_username']) ??
                'Unknown')
              : 'Unknown',
            role: 'Infrastructure',
            roles: roles,
            //tokenParsed contains handy info about user like name
            parsedUserToken: keycloak.tokenParsed,
          }),
        );
     
        dispatch(setAuthToken(keycloak.token));
        dispatch(setAuthIdToken(keycloak.idToken));
      } else {
        keycloak.login({ scope: props.scope });
      }
    }
  }, [initialized, keycloak]);

  React.useEffect(() => {
    dispatch(setIsAuthenticated(keycloak?.authenticated || false));
  }, [keycloak?.authenticated]);

  React.useEffect(() => {
    if (authRefreshErrorSel?.error) {
      keycloak.login({ scope: props.scope });
    }
  }, [authRefreshErrorSel]);

  return (
    <>
      {!keycloak?.authenticated && (
        <Box
          id="mybox"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.20)',
            position: 'absolute',
            width: '100vw',
            height: '100vh',
            zIndex: 3000,
          }}
        />
      )}
      {keyCloakErr?.error && (
        <ModalDialog
          dialogProps={{ open: true }}
          message={keyCloakErr.error || ''}
          title="Login Error"
        />
      )}
      {props.children}
    </>
  );
}

export default Login;
