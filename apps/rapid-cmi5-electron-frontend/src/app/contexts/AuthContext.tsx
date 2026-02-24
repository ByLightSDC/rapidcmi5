import {
  auth,
  authError,
  authRefreshError,
  authToken,
  authIdToken,
  isAuthenticated,
  KeycloakUi,
  setIsLoggingOut,
  setAuth,
  setAuthToken,
  setAuthIdToken,
  setIsAuthenticated,
} from '@rapid-cmi5/keycloak';
import { modal, resetPersistance, setModal } from '@rapid-cmi5/ui';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { detectIsElectron } from '../utils/appType';
import { useDispatch, useSelector } from 'react-redux';
import { UserConfigContext } from './UserConfigContext';
import { Credentials } from '@rapid-cmi5/cmi5-build-common';

import { AppDispatch } from '@rapid-cmi5/react-editor';
import ConfigureSSOCredentialsForm, {
  configureSSOCredsModalId,
} from '../shared/modals/ElectronLoginModal';

export interface AuthProps {
  children?: ReactNode;
}

interface AuthContextType {
  token?: string;
  idToken?: string;
  username?: string;
  roles?: string[];
  isAuthenticated: boolean;
  parsedUserToken?: Record<string, any>;
  loginElectron: () => void;
  logout: () => void;
  authError?: { id?: string | null; error?: string | null };
  handleSaveSSOCredsElectron: (creds: Credentials) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: undefined,
  idToken: undefined,
  username: undefined,
  roles: undefined,
  isAuthenticated: false,
  parsedUserToken: undefined,
  authError: undefined,
  loginElectron: () => {
    return;
  },
  logout: () => {
    return;
  },
  handleSaveSSOCredsElectron: (creds: Credentials) => {
    return;
  },
});

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/*
  This context exists to bridge the gap between the web applications auth and the
  electron (Desktop) auth flow.
  This should be focused on SSO and not something such as git interactions.
*/
export default function Auth(props: AuthProps) {
  const isElectron = detectIsElectron();
  const modalObj = useSelector(modal);
  const dispatch: AppDispatch = useDispatch();

  const { ssoConfig } = useContext(UserConfigContext);

  // Electron auth state
  const [electronToken, setElectronToken] = useState<string>();
  const [electronIdToken, setElectronIdToken] = useState<string>();
  const [electronError, setElectronError] = useState<{
    id: string;
    error: string;
  }>();
  const [electronUsername, setElectronUsername] = useState<string>();
  const [electronRoles, setElectronRoles] = useState<string[]>([]);
  const [electronIsAuthenticated, setElectronIsAuthenticated] = useState(false);
  const [electronParsedUserToken, setElectronParsedUserToken] = useState<any>();

  // Web auth state (from Redux/Keycloak)
  const webAppToken = useSelector(authToken);
  const webAppIdToken = useSelector(authIdToken);
  const webAppAuthError = useSelector(authError);
  const webAppAuth = useSelector(auth);

  const webAppIsAuthenticated = useSelector(isAuthenticated);

  // Unified values
  const token = isElectron ? electronToken : webAppToken;
  const idToken = isElectron ? electronIdToken : webAppIdToken;
  const error = isElectron ? electronError : webAppAuthError;
  const username = isElectron ? electronUsername : webAppAuth?.username;
  const roles = isElectron ? electronRoles : webAppAuth?.roles;
  const authenticated = isElectron
    ? electronIsAuthenticated
    : webAppIsAuthenticated;

  const parsedUserToken = isElectron
    ? electronParsedUserToken
    : webAppAuth.parsedUserToken;

  const processTokenResponse = useCallback(
    (tokenResponse: { access_token: string; id_token?: string }) => {
      const accessToken = tokenResponse.access_token;
      const idToken = tokenResponse.id_token;

      setElectronToken(accessToken);
      setElectronIdToken(idToken);
      setElectronError(undefined);
      setElectronIsAuthenticated(true);

      const parsed = parseJwtPayload(accessToken);
      setElectronParsedUserToken(parsed);

      if (parsed) {
        setElectronUsername(
          parsed['name'] || parsed['preferred_username'] || 'Unknown',
        );

        // Extract roles from resource_access using the client ID
        const clientId = ssoConfig?.keycloakClientId;
        if (clientId && parsed['resource_access']?.[clientId]?.roles) {
          setElectronRoles(parsed['resource_access'][clientId].roles);
        } else if (parsed['realm_access']?.roles) {
          setElectronRoles(parsed['realm_access'].roles);
        } else {
          setElectronRoles([]);
        }
      }
    },
    [ssoConfig?.keycloakClientId],
  );

  const clearElectronAuth = useCallback(() => {
    setElectronToken(undefined);
    setElectronIdToken(undefined);
    setElectronError(undefined);
    setElectronUsername(undefined);
    setElectronRoles([]);
    setElectronIsAuthenticated(false);
  }, []);

  // Login for the web app is taken care of through another library
  const loginElectron = useCallback(async () => {
    if (isElectron) {
      try {
        const tokenResponse = await window.userSettingsApi.loginSSO();
        processTokenResponse(tokenResponse);
      } catch (err: any) {
        setElectronError({ error: err?.message ?? String(err), id: '0' });
        setElectronIsAuthenticated(false);
        throw Error(`SSO Login Failed ${err}`);
      }
    } else {
      throw Error('loginElectron called in non-Electron environment');
    }
  }, [isElectron, processTokenResponse]);

  const logout = useCallback(() => {
    if (isElectron) {
      clearElectronAuth();
      window.userSettingsApi.logoutSSO();
    } else {
      dispatch(setIsLoggingOut(true));
    }
    dispatch(resetPersistance());
  }, [dispatch, isElectron, clearElectronAuth]);

  const handleSaveSSOCredsElectron = useCallback(
    async (data: Credentials) => {
      try {
        window.userSettingsApi.setSSOCredentials(data);
        const tokenResponse = await window.userSettingsApi.loginSSO();
        processTokenResponse(tokenResponse);
      } catch (err: any) {
        setElectronError({ error: err?.message ?? String(err), id: '0' });
        setElectronIsAuthenticated(false);
        throw err;
      }
    },
    [processTokenResponse],
  );

  const handleCloseModal = () => {
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  // Trigger login when SSO config changes or when SSO is enabled without a valid token.
  // This is only valid for electron applications
  useEffect(() => {
    const attemptLogin = async () => {
      try {
        await loginElectron();
      } catch {
        dispatch(
          setModal({ type: configureSSOCredsModalId, id: null, name: null }),
        );
      }
    };

    if (!isElectron || !ssoConfig?.ssoEnabled) return;

    const needsLogin = () => {
      if (!electronToken) return true;

      try {
        const payload = parseJwtPayload(electronToken);
        if (!payload) return true;
        const expiresInMs = payload.exp * 1000 - Date.now();
        return expiresInMs <= 0;
      } catch {
        return true;
      }
    };

    if (needsLogin()) {
      attemptLogin();
    }
  }, [isElectron, ssoConfig, electronToken, dispatch, loginElectron]);

  // Auto-refresh before token expiry (uses stored creds, no modal).
  // Only for Electron
  useEffect(() => {
    if (!isElectron || !ssoConfig?.ssoEnabled || !electronToken) return;

    try {
      const payload = parseJwtPayload(electronToken);
      if (!payload) return;

      const expiresInMs = payload.exp * 1000 - Date.now();
      if (expiresInMs <= 0) return;

      const refreshIn = Math.max(expiresInMs - 60_000, 0);
      const timeout = setTimeout(async () => {
        try {
          const tokenResponse = await window.userSettingsApi.loginSSO(true);
          processTokenResponse(tokenResponse);
        } catch {
          dispatch(
            setModal({ type: configureSSOCredsModalId, id: null, name: null }),
          );
        }
      }, refreshIn);

      return () => clearTimeout(timeout);
    } catch {
      return;
    }
  }, [
    electronToken,
    loginElectron,
    isElectron,
    ssoConfig,
    dispatch,
    processTokenResponse,
  ]);

  return (
    <AuthContext.Provider
      value={{
        authError: error,
        loginElectron,
        logout,
        token,
        idToken,
        username,
        roles,
        isAuthenticated: authenticated,
        handleSaveSSOCredsElectron,
        parsedUserToken,
      }}
    >
      {!isElectron ? (
        <WebAuth>{props.children}</WebAuth>
      ) : (
        <>
          {props.children}
          {modalObj.type === configureSSOCredsModalId && (
            <ConfigureSSOCredentialsForm
              modalObj={modalObj}
              handleCloseModal={handleCloseModal}
              handleModalAction={handleCloseModal}
              handleSaveSSOCreds={handleSaveSSOCredsElectron}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

function WebAuth(props: AuthProps) {
  const { ssoConfig } = useContext(UserConfigContext);
  const authRefreshErrorSel = useSelector(authRefreshError);
  const authErrorSel = useSelector(authError);
  const hasError = !!(authErrorSel.error || authRefreshErrorSel.error);
  if (!ssoConfig || !ssoConfig.ssoEnabled) return props.children;

  if (hasError) {
    return props.children;
  }

  return (
    <KeycloakUi
      url={ssoConfig.keycloakUrl}
      realm={ssoConfig.keycloakRealm}
      clientId={ssoConfig.keycloakClientId}
      scope={ssoConfig.keycloakScope}
    >
      {props.children}
    </KeycloakUi>
  );
}
