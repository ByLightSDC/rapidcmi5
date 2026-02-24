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

export interface CertInfo {
  id: string;
  filename: string;
  addedAt: string;
  subject?: string;
}
const SSO_CONFIG_KEY = 'rapid-cmi5:ssoConfig';
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

export default function UserConfig({ children }: UserConfigProps) {
  const isElectron = detectIsElectron();

  const [gitUser, setGitUserState] = useState<GitUserConfig>({
    authorEmail: '',
    authorName: '',
  });

  const [gitCredentials, setGitCredentialsState] = useState<Credentials>();

  const [ssoConfig, setSsoConfigState] = useState<SSOConfig>({
    keycloakClientId: '',
    keycloakRealm: '',
    keycloakScope: '',
    keycloakUrl: '',
    rangeRestApiUrl: '',
    ssoEnabled: false,
  });
  const [certs, setCerts] = useState<CertInfo[]>([]);

  // Load persisted values on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isElectron) {
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
      } else {
        const stored = localStorage.getItem(SSO_CONFIG_KEY);
        if (stored && !cancelled) {
          try {
            setSsoConfigState(JSON.parse(stored));
          } catch {
            // Corrupted data, ignore
          }
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isElectron]);

  const setGitUser = useCallback(
    (config: GitUserConfig) => {
      if (isElectron) {
        window.userSettingsApi.setGitUserConfig(config);
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
          setGitCredentialsState(creds);
        }
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
    (config: SSOConfig) => {
      if (isElectron) {
        window.userSettingsApi.setSSOConfig(config);
      } else {
        localStorage.setItem(SSO_CONFIG_KEY, JSON.stringify(config));
      }
      setSsoConfigState(config);
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
        setGitCredentials: isElectron ? setGitCredentials : undefined,
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
