import Keycloak from 'keycloak-js';
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
import { ReactNode, useRef } from 'react';

/* eslint-disable-next-line */
export interface KeycloakUiProps {
  url: string;
  realm: string;
  clientId: string;
  scope: string;
  children?: ReactNode;
}

export function KeycloakUi(props: KeycloakUiProps) {
  const dispatch = useDispatch();
  const { children = <></> } = props;

  // This will keep keycloak from regenerating over and over again
  const keycloakRef = useRef<Keycloak | null>(null);

  if (!keycloakRef.current) {
    keycloakRef.current = new Keycloak({
      url: props.url,
      realm: props.realm,
      clientId: props.clientId,
    });
  }

  const keycloak = keycloakRef.current;
  (window as any).keycloak = keycloak;

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
              id: event ?? 'unknown event',
            }),
          );
          break;
        default:
          break;
      }
    }
  };

  const onKeycloakTokensUpdate = (tokens: any) => {
    if (!tokens?.token) return;

    if (typeof tokens.idToken === 'undefined') {
      dispatch(
        setAuthRefreshError({
          error: 'Unknown Error: 400 or 500 refreshing token',
        }),
      );
    } else {
      dispatch(setAuthToken(tokens.token));
      dispatch(setAuthIdToken(tokens.idToken));
    }
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={onKeycloakEvent}
      onTokens={onKeycloakTokensUpdate}
      initOptions={{
        checkLoginIframe: false,
        onLoad: 'login-required',
        pkceMethod: 'S256',
      }}
    >
      <Login scope={props.scope} clientId={props.clientId}>
        {children}
      </Login>
    </ReactKeycloakProvider>
  );
}

export default KeycloakUi;
