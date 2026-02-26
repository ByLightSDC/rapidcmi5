import Store from 'electron-store';
import axios from 'axios';
import { safeStorage } from 'electron';

import {
  Credentials,
  GitUserConfig,
  SSOConfig,
  TokenResponse,
} from '@rapid-cmi5/cmi5-build-common';

interface StoreSchema {
  ssoConfig: SSOConfig | null;
  gitUserConfig: GitUserConfig | null;
  ssoCredentials: string | null;
  gitCredentials: string | null;
  refreshToken: string | null;
}

export const store = new Store<StoreSchema>({
  defaults: {
    ssoConfig: null,
    gitUserConfig: null,
    refreshToken: null,
    ssoCredentials: null,
    gitCredentials: null,
  },
});

// No custom httpsAgent needed — applyCustomCerts() patches TLS globally
const http = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export function encryptCredentials(credentials: Credentials): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  const json = JSON.stringify(credentials);
  const encrypted = safeStorage.encryptString(json);
  return encrypted.toString('base64');
}

export function decryptCredentials(encrypted: string): Credentials | null {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  try {
    const buffer = Buffer.from(encrypted, 'base64');
    const decrypted = safeStorage.decryptString(buffer);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function encryptToken(token: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  const encrypted = safeStorage.encryptString(token);
  return encrypted.toString('base64');
}

export function decryptToken(encrypted: string): string | null {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  try {
    const buffer = Buffer.from(encrypted, 'base64');
    return safeStorage.decryptString(buffer);
  } catch {
    return null;
  }
}

export async function loginWithRefreshOrPassword(
  currentRefreshToken?: string | null,
): Promise<TokenResponse> {
  if (currentRefreshToken) {
    try {
      const tokens = await refreshToken(currentRefreshToken);
      return tokens;
    } catch (err) {
      console.warn(
        'Refresh token failed, falling back to password login:',
        err,
      );
    }
  }

  return loginSSO();
}

export async function loginSSO(): Promise<TokenResponse> {
  const config: SSOConfig | null = store.get('ssoConfig') as SSOConfig | null;
  const credsEnc: string | null = store.get('ssoCredentials') as string | null;

  if (!credsEnc) {
    throw new Error('Encrypted credentials not found');
  }
  const creds = decryptCredentials(credsEnc);

  if (!config) {
    throw new Error('SSO config not found');
  }

  if (!creds?.username || !creds?.password) {
    throw new Error('Username or password not found');
  }

  const tokenUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/token`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: config.keycloakClientId,
    username: creds.username,
    password: creds.password,
  });

  const { data } = await http.post<TokenResponse>(tokenUrl, params.toString());
  return data;
}

export async function refreshToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const config: SSOConfig | null = store.get('ssoConfig') as SSOConfig | null;

  if (!config) {
    throw new Error('SSO config not found');
  }

  const tokenUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/token`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.keycloakClientId,
    refresh_token: refreshToken,
  });

  const { data } = await http.post<TokenResponse>(tokenUrl, params.toString());
  return data;
}

export async function logoutSSO(refreshToken: string): Promise<void> {
  const config: SSOConfig | null = store.get('ssoConfig') as SSOConfig | null;

  if (!config) {
    throw new Error('SSO config not found');
  }

  const logoutUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/logout`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    client_id: config.keycloakClientId,
    refresh_token: refreshToken,
  });

  await http.post(logoutUrl, params.toString());
  store.delete('ssoCredentials');
}
