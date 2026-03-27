import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { detectIsElectron } from '../utils/appType';
import {
  Credentials,
  GitUserConfig,
  SSOConfig,
} from '@rapid-cmi5/cmi5-build-common';
import { config } from '@rapid-cmi5/ui';

export interface CertInfo {
  id: string;
  filename: string;
  addedAt: string;
  subject?: string;
}

interface UserConfigContextType {
  gitUser?: GitUserConfig;
  setGitUser: (config: GitUserConfig) => void;
  ssoConfig?: SSOConfig;
  setSSOConfig: (config: SSOConfig) => void;
  setGitCredentials?: (creds: Credentials) => void;
  gitCredentials?: Credentials;
  clearGitCredentials: () => void;
  // Certificates
  certs: CertInfo[];
  addCert: (filename: string, contents: string) => Promise<void>;
  removeCert: (id: string) => Promise<void>;
  refreshCerts: () => Promise<void>;
}

const noop = () => {
  return;
};
const asyncNoop = async () => {
  return;
};

/* 
  This context exists to have a global user configuration management point.
  Currently this is focused mainly on the Electron side but should be expanded for the web application.
  A user should be able to configure something once and have it track across all courses and repos in their application,
  they should not be required to type in things such as urls or username and email over and over again.
*/
export const UserConfigContext = createContext<UserConfigContextType>({
  setGitUser: noop,
  setSSOConfig: noop,
  clearGitCredentials: noop,
  certs: [],
  addCert: asyncNoop,
  removeCert: asyncNoop,
  refreshCerts: asyncNoop,
});

interface UserConfigProps {
  children: ReactNode;
}

function getWebSSOConfig(): SSOConfig {
  return {
    keycloakClientId: config.KEYCLOAK_CLIENT_ID || '',
    keycloakRealm: config.KEYCLOAK_REALM || '',
    keycloakScope: config.KEYCLOAK_SCOPE || '',
    keycloakUrl: config.KEYCLOAK_URL || '',
    rangeRestApiUrl: config.DEVOPS_API_URL || '',
    quizBankApiUrl: config.QUIZBANK_API_URL || '',
    ssoEnabled: config.KEYCLOAK_URL ? true : false,
  };
}

export default function UserConfig({ children }: UserConfigProps) {
  const isElectron = detectIsElectron();

  const [gitUser, setGitUserState] = useState<GitUserConfig>({
    authorEmail: '',
    authorName: '',
  });

  const [gitCredentials, setGitCredentialsState] = useState<Credentials>();

  const [ssoConfig, setSsoConfigState] = useState<SSOConfig>(() => {
    if (!isElectron) {
      return getWebSSOConfig();
    }
    return {
      keycloakClientId: '',
      keycloakRealm: '',
      keycloakScope: '',
      keycloakUrl: '',
      rangeRestApiUrl: '',
      quizBankApiUrl: '',
      ssoEnabled: false,
    };
  });

  const [certs, setCerts] = useState<CertInfo[]>([]);

  const GIT_USER_STORAGE_KEY = 'rapidcmi5.gitUser';

  // Load persisted values on mount
  useEffect(() => {
    if (!isElectron) {
      const stored = localStorage.getItem(GIT_USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as GitUserConfig;
          setGitUserState(parsed);
        } catch {
          // ignore malformed data
        }
      }
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [userConfig, gitCreds, ssoConfig, certList] = await Promise.all([
        window.userSettingsApi.getGitUserConfig(),
        window.userSettingsApi.getGitCredentials(),
        window.userSettingsApi.getSSOConfig(),
        window.userSettingsApi.listCerts(),
      ]);

      if (!cancelled) {
        setGitUserState(userConfig);
        setGitCredentialsState(gitCreds);
        setSsoConfigState(ssoConfig);
        setCerts(certList);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isElectron]);

  const setGitUser = useCallback(
    (config: GitUserConfig) => {
      if (isElectron) {
        window.userSettingsApi.setGitUserConfig(config);
      } else {
        localStorage.setItem(
          GIT_USER_STORAGE_KEY,
          JSON.stringify({
            authorName: config.authorName,
            authorEmail: config.authorEmail,
          }),
        );
      }
      setGitUserState(config);
    },
    [isElectron],
  );

  const setGitCredentials = useCallback(
    (creds: Credentials) => {
      try {
        if (isElectron) {
          window.userSettingsApi.setGitCredentials(creds);
        }
        setGitCredentialsState(creds);
      } catch (error) {
        console.error('Failed to set git credentials:', error);
      }
    },
    [isElectron],
  );

  const clearGitCredentials = useCallback(() => {
    try {
      if (isElectron) {
        window.userSettingsApi.clearGitCredentials();
      }
    } catch (error) {
      console.error('Failed to clear git credentials:', error);
    }
  }, [isElectron]);

  const setSSOConfig = useCallback(
    (cfg: SSOConfig) => {
      if (isElectron) {
        window.userSettingsApi.setSSOConfig(cfg);
      }
      setSsoConfigState(cfg);
    },
    [isElectron],
  );

  const refreshCerts = useCallback(async () => {
    if (isElectron) {
      const certList = await window.userSettingsApi.listCerts();
      setCerts(certList);
    }
  }, [isElectron]);

  const addCert = useCallback(
    async (filename: string, contents: string) => {
      if (isElectron) {
        await window.userSettingsApi.addCert(filename, contents);
        await refreshCerts();
      }
    },
    [isElectron, refreshCerts],
  );

  const removeCert = useCallback(
    async (id: string) => {
      if (isElectron) {
        await window.userSettingsApi.removeCert(id);
        await refreshCerts();
      }
    },
    [isElectron, refreshCerts],
  );

  return (
    <UserConfigContext.Provider
      value={{
        gitUser,
        setGitUser,
        setGitCredentials,
        gitCredentials,
        clearGitCredentials,
        setSSOConfig,
        ssoConfig,
        certs,
        addCert,
        removeCert,
        refreshCerts,
      }}
    >
      {children}
    </UserConfigContext.Provider>
  );
}
