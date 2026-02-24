import {
  authError,
  authRefreshError,
  authToken,
  KeycloakUi,
  setIsLoggingOut,
} from '@rapid-cmi5/keycloak';
import { modal, resetPersistance, setModal, useToaster } from '@rapid-cmi5/ui';
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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export interface AuthProps {
  children?: ReactNode;
}

interface AuthContextType {
  token?: string;
  login: () => void;
  logout: () => void;
  authError?: { id?: string | null; error?: string | null };
  handleSaveSSOCreds: (creds: Credentials) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: undefined,
  authError: undefined,
  login: () => {
    return;
  },
  logout: () => {
    return;
  },
  handleSaveSSOCreds: (creds: Credentials) => {
    return;
  },
});

export default function Auth(props: AuthProps) {
  const isElectron = detectIsElectron();
  const modalObj = useSelector(modal);
  const dispatch: AppDispatch = useDispatch();

  const { ssoConfig } = useContext(UserConfigContext);

  // Electron auth state
  const [electronToken, setElectronToken] = useState<string>();
  const [electronError, setElectronError] = useState<{
    id: string;
    error: string;
  }>();

  // Web auth state (from Redux/Keycloak)
  const webAppToken = useSelector(authToken);
  const webAppAuthError = useSelector(authError);

  // Unified values
  const token = isElectron ? electronToken : webAppToken;
  const error = isElectron ? electronError : webAppAuthError;

  const login = useCallback(async () => {
    if (isElectron) {
      try {
        const tokenResponse = await window.userSettingsApi.loginSSO();
        setElectronToken(tokenResponse.access_token);
        setElectronError(undefined);
      } catch (err: any) {
        setElectronError({ error: err?.message ?? String(err), id: '0' });
        throw Error(`SSO Login Failed ${err}`);
      }
    }
  }, [isElectron]);

  const logout = useCallback(() => {
    if (isElectron) {
      setElectronToken(undefined);
      setElectronError(undefined);
      window.userSettingsApi.logoutSSO();
    } else {
      dispatch(setIsLoggingOut(true));
    }
    dispatch(resetPersistance());
  }, [dispatch, isElectron]);

  const handleSaveSSOCreds = useCallback(async (data: Credentials) => {
    try {
      window.userSettingsApi.setSSOCredentials(data);
      const tokenResponse = await window.userSettingsApi.loginSSO();
      setElectronToken(tokenResponse.access_token);
      setElectronError(undefined);
    } catch (err: any) {
      setElectronError({ error: err?.message ?? String(err), id: '0' });
      throw err; // Re-throw so MiniForm can handle it as a failure
    }
  }, []);

  const handleCloseModal = () => {
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  // Trigger login when SSO config changes or when SSO is enabled without a valid token
  useEffect(() => {
    const attemptLogin = async () => {
      try {
        await login();
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
        const payload = JSON.parse(atob(electronToken.split('.')[1]));
        const expiresInMs = payload.exp * 1000 - Date.now();
        return expiresInMs <= 0;
      } catch {
        return true; // Malformed token
      }
    };

    if (needsLogin()) {
      attemptLogin();
    }
  }, [isElectron, ssoConfig, electronToken, dispatch, login]);

  // Auto-refresh before token expiry (uses stored creds, no modal)
  useEffect(() => {
    if (!isElectron || !ssoConfig?.ssoEnabled || !electronToken) return;

    try {
      const payload = JSON.parse(atob(electronToken.split('.')[1]));
      const expiresInMs = payload.exp * 1000 - Date.now();

      if (expiresInMs <= 0) return;

      const refreshIn = Math.max(expiresInMs - 60_000, 0);
      const timeout = setTimeout(async () => {
        try {
          // Silent refresh using stored refresh token
          const tokenResponse = await window.userSettingsApi.loginSSO(true);
          setElectronToken(tokenResponse.access_token);
        } catch {
          // Refresh failed — prompt user to re-login
          dispatch(
            setModal({ type: configureSSOCredsModalId, id: null, name: null }),
          );
        }
      }, refreshIn);

      return () => clearTimeout(timeout);
    } catch {
      // Malformed token
      return;
    }
  }, [electronToken, login, isElectron, ssoConfig, dispatch]);

  return (
    <AuthContext.Provider
      value={{ authError: error, login, logout, token, handleSaveSSOCreds }}
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
              handleSaveSSOCreds={handleSaveSSOCreds}
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
  const errorMessage = authErrorSel.error || authRefreshErrorSel.error;

  if (!ssoConfig || !ssoConfig.ssoEnabled) return props.children;

  if ( hasError) {
    console.log("Has error", errorMessage)
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
