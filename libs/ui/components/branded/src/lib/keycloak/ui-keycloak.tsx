import { config } from '@rapid-cmi5/ui/branded';
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

    if (error) {
      const errorDetailDecoded = decodeURIComponent(
        (error as AuthClientError).error_description?.replace(/\+/g, '%20'),
      );

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

    if (typeof tokens?.idToken === 'undefined') {
      dispatch(
        setAuthRefreshError({
          error: 'Unknown Error: 400 or 500 refreshing token',
        }),
      );
    } else {
      if (tokens) {
        //REF axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.token}`;
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
