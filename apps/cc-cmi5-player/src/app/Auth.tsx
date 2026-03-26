import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  auConfigInitializedSel,
  auJsonSel,
  setIsDisplayInitialized,
} from './redux/auReducer';
import { config, debugLog } from '@rapid-cmi5/ui';
import { authToken, KeycloakUi } from '@rapid-cmi5/keycloak';
import { queryHooksConfig } from '@rangeos-nx/frontend/clients/hooks';
import { logger } from './debug';

/* eslint-disable-next-line */
export interface AuthProps {
  children?: JSX.Element;
}

/**
 * Component waits for configuration to be initialized
 * If SSO is enabled, turns on the KeyCloak component
 * Stores token in query config
 * @param props
 * @returns
 */
export default function Auth(props: AuthProps) {
  const token = useSelector(authToken);

  const isConfigInitialized = useSelector(auConfigInitializedSel);
  const dispatch = useDispatch();


  const shouldDisplayKeyCloak =
    isConfigInitialized &&
    config.CMI5_SSO_ENABLED &&
    config.KEYCLOAK_URL &&
    config.KEYCLOAK_REALM &&
    config.KEYCLOAK_CLIENT_ID &&
    config.KEYCLOAK_SCOPE;

  const authorNoAuth = useMemo(() => {
    logger.debug('check auth config', config, 'auth');

    if (shouldDisplayKeyCloak) {
      logger.debug('starting Keycloak', undefined, 'auth');
      return (
        <KeycloakUi
          url={config.KEYCLOAK_URL}
          realm={config.KEYCLOAK_REALM}
          clientId={config.KEYCLOAK_CLIENT_ID}
          scope={config.KEYCLOAK_SCOPE}
        >
          {props.children}
        </KeycloakUi>
      );
    }

    return <div>{props.children}</div>;
  }, [props.children, shouldDisplayKeyCloak]);

  //set query to use sso token
  //only if AU is configured for team exercise
  useEffect(() => {
    //REF debug logger.debug('auth token', token, 'auth');
    if (config.CMI5_SSO_ENABLED) {
      if (token) {
        queryHooksConfig.headers.Authorization = token;
        dispatch(setIsDisplayInitialized(true));
      }
    }
  }, [token, dispatch, isConfigInitialized]);

  //sso is non blocking in this app
  return authorNoAuth;
}
