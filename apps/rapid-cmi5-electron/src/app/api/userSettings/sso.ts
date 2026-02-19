// main/store.ts
import Store from 'electron-store';
import { BrowserWindow, ipcMain, safeStorage } from 'electron';
import {
  GitCredentials,
  SSOConfig,
  TokenResponse,
} from '@rapid-cmi5/cmi5-build-common';
import path from 'path';

export interface SSOCredentials {
  username?: string;
  password?: string;
}

interface StoreSchema {
  ssoConfig: SSOConfig | null;
  ssoCredentials: string | null;
  refreshToken: string | null;
}

export const store = new Store<StoreSchema>({
  defaults: {
    ssoConfig: null,
    refreshToken: null,
    gitCreds: null,
  },
});

export function encryptGitCredentials(credentials: GitCredentials): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  const json = JSON.stringify(credentials);
  const encrypted = safeStorage.encryptString(json);
  return encrypted.toString('base64');
}

export function decryptGitCredentials(
  encrypted: string,
): GitCredentials | null {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  try {
    const buffer = Buffer.from(encrypted, 'base64');
    const decrypted = safeStorage.decryptString(buffer);
    return JSON.parse(decrypted) as GitCredentials;
  } catch {
    return null;
  }
}

// Encrypt credentials
export function encryptCredentials(credentials: SSOCredentials): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption not available on this system');
  }
  const json = JSON.stringify(credentials);
  const encrypted = safeStorage.encryptString(json);
  return encrypted.toString('base64');
}

// Decrypt credentials
export function decryptCredentials(encrypted: string): SSOCredentials | null {
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

export async function loginWithRefreshOrPassword(
  currentRefreshToken?: string | null,
): Promise<TokenResponse> {
  // 1. Try refresh token first if we have one
  if (currentRefreshToken) {
    try {
      const tokens = await refreshToken(currentRefreshToken);
      console.log('Token refreshed successfully');
      return tokens;
    } catch (err) {
      console.warn(
        'Refresh token failed, falling back to password login:',
        err,
      );
      // Fall through to password login
    }
  }

  // 2. Fall back to password login
  return loginSSO();
}

export async function loginSSO(): Promise<TokenResponse> {
  //@ts-ignore
  const config: SSOConfig | null = store.get('ssoConfig');
  //   const encryptedCreds = store.get('ssoCredentials');
  if (!config) {
    throw new Error('SSO config not found');
  }

  if (!config?.username || !config?.password) {
    throw new Error('Username or password not found');
  }

  // Build the token endpoint URL
  // Keycloak format: {keycloakUrl}/realms/{realm}/protocol/openid-connect/token
  const tokenUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/token`,
    config.keycloakUrl,
  ).toString();

  // Build the request body
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: config.keycloakClientId,
    username: config.username,
    password: config.password,
    // scope: config.keycloakScope,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SSO login failed: ${response.status} - ${error}`);
  }

  console.log('response', response);
  const tokenData: TokenResponse = await response.json();
  return tokenData;
}

// Refresh token when it expires
export async function refreshToken(
  refreshToken: string,
): Promise<TokenResponse> {
  //@ts-ignore
  const config: SSOConfig | null = store.get('ssoConfig');
  //   const encryptedCreds = store.get('ssoCredentials');

  if (!config) {
    throw new Error('SSO config not found');
  }

  //   const credentials = encryptedCreds
  //     ? decryptCredentials(encryptedCreds)
  //     : null;

  const tokenUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/token`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.keycloakClientId,
    refresh_token: refreshToken,
  });

  //   if (credentials?.clientSecret) {
  //     params.append('client_secret', credentials.clientSecret);
  //   }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${error}`);
  }

  return response.json();
}

// Logout / revoke token
export async function logoutSSO(refreshToken: string): Promise<void> {
  //@ts-ignore
 
  const config: SSOConfig | null = store.get('ssoConfig');
  //@ts-ignore
 
  const encryptedCreds = store.get('ssoCredentials');

  if (!config) {
    throw new Error('SSO config not found');
  }

  const credentials = encryptedCreds
    ? decryptCredentials(encryptedCreds)
    : null;

  const logoutUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/logout`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    client_id: config.keycloakClientId,
    refresh_token: refreshToken,
  });

  //   if (credentials?.clientSecret) {
  //     params.append('client_secret', credentials.clientSecret);
  //   }

  await fetch(logoutUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
}
