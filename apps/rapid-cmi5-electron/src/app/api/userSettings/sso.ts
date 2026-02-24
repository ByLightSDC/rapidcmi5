// main/store.ts

import Store from 'electron-store';
import https from 'https';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { app, safeStorage } from 'electron';

import {
  Credentials,
  SSOConfig,
  TokenResponse,
} from '@rapid-cmi5/cmi5-build-common';

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

function loadCustomCAs(): string[] {
  const certsDir = path.join(app.getPath('userData'), 'custom-certs');

  try {
    if (!fs.existsSync(certsDir)) return [];

    return fs
      .readdirSync(certsDir)
      .filter((f) => f.endsWith('.pem') || f.endsWith('.crt') || f.endsWith('.cer'))
      .map((f) => fs.readFileSync(path.join(certsDir, f), 'utf-8'));
  } catch {
    return [];
  }
}

function createHttpsAgent(): https.Agent {
  const customCAs = loadCustomCAs();

  if (customCAs.length > 0) {
    return new https.Agent({ ca: customCAs });
  }

  // No custom certs — use default system CA trust store
  return new https.Agent();
}

const http = axios.create({
  httpsAgent: createHttpsAgent(),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

/**
 * Rebuild the https agent with the latest custom certs.
 * Call after adding or removing certificates.
 */
export function refreshHttpsAgent(): void {
  http.defaults.httpsAgent = createHttpsAgent();
}

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
  // @ts-ignore
  const config: SSOConfig | null = store.get('ssoConfig') as SSOConfig | null;
  // @ts-ignore
  const credsEnc: string | null = store.get('ssoCredsEnc') as string | null;

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
  // @ts-ignore
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
  // @ts-ignore
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
  // @ts-ignore
  store.delete('ssoCredsEnc');
}