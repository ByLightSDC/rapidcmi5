import { config } from '@rapid-cmi5/frontend/environment';
import Keycloak, { KeycloakConfig } from 'keycloak-js';
import { AuthClientError } from '@react-keycloak/core';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useDispatch } from 'react-redux';

import {
  setAuthError,
  setAuthIdToken,
  setAuthRefreshError,
  setAuthToken,
} from './reducer';

import { Login } from './login';
const currentMinLogLevel = config.CLIENT_LOG ? 0 : -1;

export const debugColor2 = 'background:lightblue';
export const debugColor3 = 'background:lightgrey';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugLog = (m1?: string, m2?: any, p?: number) => {
  if (currentMinLogLevel >= 0) {
    //0 no color, 1 color
    if (typeof m2 !== 'undefined') {
      if (typeof m2 === 'number') {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('log => ' + m1, m2);
          }
        } else {
          //asume m2 is the priority
          if (m2 >= currentMinLogLevel) {
            console.log('%c ' + m1, debugColor2);
          }
        }
      } else {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('%c ' + m1, m2);
          }
        } else {
          //console.log(m1, m2);
          //TEMP to prove using debugLog
          console.log('log => ' + m1, m2);
        }
      }
    } else {
      //console.log(m1);
      //TEMP to prove using debugLog
      console.log('%c ' + m1, debugColor3);
    }
  }
};

/* eslint-disable-next-line */
export interface KeycloakUiProps {
  url: string;
  realm: string;
  clientId: string;
  scope: string;
  children?: JSX.Element;
}

export function KeycloakUi(props: KeycloakUiProps) {
  const dispatch = useDispatch();

  // eslint-disable-next-line react/jsx-no-useless-fragment
  const { children = <></> } = props;

  const onKeycloakEvent = (event: unknown, error: unknown) => {
    debugLog('onKeycloakEvent');
    debugLog('event', event);
    debugLog('error', error);

    if (error) {
      const errorDetailDecoded = decodeURIComponent(
        (error as AuthClientError).error_description?.replace(/\+/g, '%20'),
      );

      debugLog('error', (error as AuthClientError).error);
      dispatch(
        setAuthError({
          error: (error as AuthClientError).error,
          id: errorDetailDecoded,
        }),
      );
    } else {
      switch (event) {
        case 'onAuthSuccess':
        case 'onReady':
        case 'onTokenExpired':
        case 'onAuthLogout':
          break;
        case 'onInitError':
        case 'onAuthRefreshError':
          dispatch(
            setAuthError({
              error: 'Unknown Error: onInitError',
              id: event ?? 'uknown event',
            }),
          );
          break;
        default:
          break;
      }
    }
  };

  // this handles both the initial token and the automatic refreshes
  const onKeycloakTokensUpdate = (tokens: any) => {
    debugLog('onKeycloakTokensUpdate');
    debugLog('tokens', tokens);
    if (typeof tokens?.idToken === 'undefined') {
      dispatch(
        setAuthRefreshError({
          error: 'Unknown Error: 400 or 500 refreshing token',
        }),
      );
    } else {
      if (tokens) {
        //REF axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.token}`;
        debugLog('setAuthToken from KK Refresh');
        dispatch(setAuthToken(tokens.token));
        dispatch(setAuthIdToken(tokens.idToken));
      }
    }
  };

  // set up keycloak here, after configs may have been overwritten
  const config: KeycloakConfig = {
    url: props.url,
    realm: props.realm,
    clientId: props.clientId,
  };
  const keycloak = new Keycloak(config);

  (window as any).keycloak = keycloak;
  debugLog('Keycloak Config');
  debugLog('keycloak', keycloak);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={onKeycloakEvent}
      onTokens={onKeycloakTokensUpdate}
      //required to avoid issue where firefox loops
      initOptions={{ checkLoginIframe: false }}
    >
      <Login scope={props.scope}>{children}</Login>
    </ReactKeycloakProvider>
  );
}

export default KeycloakUi;
