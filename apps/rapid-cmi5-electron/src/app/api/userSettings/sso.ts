import { join } from 'path';
import Store from 'electron-store';
import { BrowserWindow, safeStorage } from 'electron';
import * as oidc from 'openid-client';

import {
  Credentials,
  GitUserConfig,
  SSOConfig,
  TokenResponse,
} from '@rapid-cmi5/cmi5-build-common';
import { STANDARD_SPLASH } from './loginPortal';

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

let _cachedOidc: { key: string; config: oidc.Configuration } | null = null;

async function getOidcConfig(): Promise<oidc.Configuration> {
  const ssoConfig = store.get('ssoConfig') as SSOConfig | null;
  if (!ssoConfig) throw new Error('SSO config not found');

  const key = `${ssoConfig.keycloakUrl}|${ssoConfig.keycloakRealm}|${ssoConfig.keycloakClientId}`;
  if (_cachedOidc?.key === key) return _cachedOidc.config;

  const baseUrl = ssoConfig.keycloakUrl.replace(/\/$/, '');
  const issuerUrl = new URL(`${baseUrl}/realms/${ssoConfig.keycloakRealm}`);

  const config = await oidc.discovery(issuerUrl, ssoConfig.keycloakClientId);
  _cachedOidc = { key, config };
  return config;
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

export async function loginWithRefreshOrRedirect(
  currentRefreshToken?: string | null,
): Promise<TokenResponse> {
  if (currentRefreshToken) {
    try {
      return await refreshToken(currentRefreshToken);
    } catch (err) {
      console.warn(
        'Refresh token failed, falling back to redirect login:',
        err,
      );
      store.delete('refreshToken');
    }
  }

  return loginSSORedirect();
}

export async function loginSSORedirect(): Promise<TokenResponse> {
  const ssoConfig = store.get('ssoConfig') as SSOConfig | null;

  if (!ssoConfig) throw new Error('SSO config not found');
  if (!ssoConfig.redirectUrl)
    throw new Error('SSO redirect URL is not configured');

  // Normalize through URL so the authorize request and the token-exchange
  // request send the byte-identical redirect_uri. openid-client derives the
  // token-exchange redirect_uri from new URL(callback).href with search/hash
  // stripped, which silently rewrites missing paths, default ports, and case
  // — if we don't normalize here too, Keycloak rejects with invalid_grant
  // "Incorrect redirect_uri".
  const normalized = new URL(ssoConfig.redirectUrl);
  normalized.search = '';
  normalized.hash = '';
  const redirectUri = normalized.href;
  const config = await getOidcConfig();

  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();

  const authUrl = oidc.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: ssoConfig.keycloakScope || 'openid',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  return new Promise((resolve, reject) => {
    let handled = false;

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Sign In',
      icon: join(
        __dirname,
        'assets',
        process.platform === 'win32' ? 'icon.ico' : 'icon.png',
      ),
      autoHideMenuBar: true,
      backgroundColor: '#0f172a',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Keycloak requests a client certificate for CAC login.
    // Only update the title — do NOT loadURL here or it cancels the auth navigation.
    // The dark backgroundColor keeps the window from looking broken while the OS picker is open.
    win.webContents.on('select-client-certificate', () => {
      win.setTitle('CAC Authentication – Select Your Certificate');
    });

    const handleRedirect = async (url: string) => {
      if (handled || !url.startsWith(redirectUri)) return;
      handled = true;
      win.close();

      try {
        const tokens = await oidc.authorizationCodeGrant(
          config,
          new URL(url),
          {
            pkceCodeVerifier: codeVerifier,
            expectedState: state,
          },
        );
        resolve(tokens as unknown as TokenResponse);
      } catch (err) {
        reject(err as Error);
      }
    };

    // will-redirect fires before the browser makes a request to the redirect URI —
    // we capture the code and close the window without ever loading the web app.
    win.webContents.on('will-redirect', (event, url) => {
      if (url.startsWith(redirectUri)) {
        event.preventDefault();
        handleRedirect(url);
      }
    });

    win.on('closed', () => {
      if (!handled) reject(new Error('Login cancelled'));
    });

    // Show generic splash, then navigate to auth URL once it renders.
    win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(STANDARD_SPLASH)}`,
    );
    win.webContents.once('did-finish-load', () => {
      win.webContents.loadURL(authUrl.href);
    });
  });
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  const config = await getOidcConfig();
  const tokens = await oidc.refreshTokenGrant(config, token);
  return tokens as unknown as TokenResponse;
}

export async function logoutSSO(token: string): Promise<void> {
  const config = await getOidcConfig();
  await oidc.tokenRevocation(config, token);
  store.delete('ssoCredentials');
  store.delete('refreshToken');
}
