import crypto from 'crypto';
import Store from 'electron-store';
import axios from 'axios';
import { BrowserWindow, safeStorage } from 'electron';

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
const httpClient = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
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

interface TokenResponseWithIdToken extends TokenResponse {
  id_token?: string;
}

function validateTokenClaims(
  idToken: string,
  expectedIssuer: string,
  expectedClientId: string,
  expectedNonce: string,
): void {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid id_token format');

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new Error('Failed to parse id_token payload');
  }

  if (payload['iss'] !== expectedIssuer) {
    throw new Error(`Token issuer mismatch: got ${payload['iss']}`);
  }

  const aud = Array.isArray(payload['aud']) ? payload['aud'] : [payload['aud']];
  if (!aud.includes(expectedClientId)) {
    throw new Error('Token audience does not include client_id');
  }

  if (payload['nonce'] !== expectedNonce) {
    throw new Error('Token nonce mismatch');
  }
}

function buildSplashHtml(message: string, detail: string): string {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0f172a;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 20px;
    user-select: none;
    -webkit-user-select: none;
  }
  .shield {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 4px 24px rgba(59,130,246,0.35);
  }
  .message {
    font-size: 18px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }
  .detail {
    font-size: 13px;
    color: #94a3b8;
    max-width: 340px;
    text-align: center;
    line-height: 1.65;
  }
  .spinner-wrap { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #1e293b;
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  .spinner-label { font-size: 12px; color: #475569; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
  <div class="shield">🔐</div>
  <div class="message">${message}</div>
  <div class="detail">${detail}</div>
  <div class="spinner-wrap">
    <div class="spinner"></div>
    <span class="spinner-label">Connecting to identity provider...</span>
  </div>
</body>
</html>`;
  return html;
}

const STANDARD_SPLASH = buildSplashHtml(
  'Signing In',
  'Complete sign-in in this window. You will be redirected automatically once authenticated.',
);

export async function loginSSORedirect(): Promise<TokenResponse> {
  const config: SSOConfig | null = store.get('ssoConfig') as SSOConfig | null;

  if (!config) throw new Error('SSO config not found');
  if (!config.redirectUrl) throw new Error('SSO redirect URL is not configured');

  const redirectUri = config.redirectUrl;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('base64url');
  const nonce = crypto.randomBytes(16).toString('base64url');

  const authUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/auth`,
    config.keycloakUrl,
  );
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', config.keycloakClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', config.keycloakScope || 'openid');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return new Promise((resolve, reject) => {
    let handled = false;

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'Sign In',
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

      const parsed = new URL(url);
      const error = parsed.searchParams.get('error');
      if (error) {
        reject(
          new Error(
            `SSO error: ${error} — ${parsed.searchParams.get('error_description') ?? ''}`,
          ),
        );
        return;
      }

      if (parsed.searchParams.get('state') !== state) {
        reject(new Error('State mismatch — possible CSRF'));
        return;
      }

      const code = parsed.searchParams.get('code');
      if (!code) {
        reject(new Error('No authorization code in callback'));
        return;
      }

      try {
        resolve(
          await exchangeAuthCode(
            config,
            code,
            codeVerifier,
            redirectUri,
            nonce,
          ),
        );
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
      win.webContents.loadURL(authUrl.toString());
    });
  });
}

async function exchangeAuthCode(
  config: SSOConfig,
  code: string,
  codeVerifier: string,
  redirectUri: string,
  nonce: string,
): Promise<TokenResponse> {
  const tokenUrl = new URL(
    `realms/${config.keycloakRealm}/protocol/openid-connect/token`,
    config.keycloakUrl,
  ).toString();

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.keycloakClientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const { data } = await httpClient.post<TokenResponseWithIdToken>(
    tokenUrl,
    params.toString(),
  );

  if (data.id_token) {
    const expectedIssuer = new URL(
      `realms/${config.keycloakRealm}`,
      config.keycloakUrl,
    ).toString();
    validateTokenClaims(
      data.id_token,
      expectedIssuer,
      config.keycloakClientId,
      nonce,
    );
  }

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

  const { data } = await httpClient.post<TokenResponse>(
    tokenUrl,
    params.toString(),
  );
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

  await httpClient.post(logoutUrl, params.toString());
  store.delete('ssoCredentials');
}
