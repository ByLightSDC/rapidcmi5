import { KeycloakUi } from '@rapid-cmi5/ui/keycloak';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authToken } from '@rapid-cmi5/ui/keycloak';
import { queryHooksConfig } from '@rapid-cmi5/ui';
import {
  auConfigInitializedSel,
  setIsDisplayInitialized,
} from './redux/auReducer';
import { config, debugLog } from '@rapid-cmi5/ui';

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

  const authorNoAuth = useMemo(() => {
    if (isConfigInitialized && config.CMI5_SSO_ENABLED) {
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

    return props.children;
  }, [isConfigInitialized, props.children]);

  //set query to use sso token
  //only if AU is configured for team exercise
  useEffect(() => {
    if (config.CMI5_SSO_ENABLED) {
      if (token) {
        queryHooksConfig.headers.Authorization = token;
        dispatch(setIsDisplayInitialized(true));
      }
    }
  }, [token, dispatch, isConfigInitialized]);

  //sso is non blocking in this app
  debugLog('isConfigInitialized', isConfigInitialized);
  debugLog('config.CMI5_SSO_ENABLED', config.CMI5_SSO_ENABLED);

  return authorNoAuth;
}
