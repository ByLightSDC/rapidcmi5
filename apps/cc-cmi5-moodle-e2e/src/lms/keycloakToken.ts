import { moodleEnv } from '../moodle/env';

/**
 * Mints a rangeos-api access token via Keycloak password grant against the
 * `rangeos-dashboard` PUBLIC client (Direct Access Grants enabled), using the
 * e2e bot creds. Self-renewing — no manually-pasted JWT — and crucially makes
 * the DEPLOY user the same as the launch/bot user, so team-scenario range
 * lookups resolve.
 *
 * If RANGEOS_API_JWT is set in the env it's used verbatim (manual override,
 * e.g. to deploy as a specific account); otherwise we mint from the bot creds.
 *
 * Token is cached for the process and re-minted shortly before expiry.
 */

let cached: { token: string; expiresAt: number } | undefined;

async function mintFromKeycloak(): Promise<{ token: string; ttlMs: number }> {
  const url = `${moodleEnv.keycloakUrl.replace(/\/$/, '')}/realms/${encodeURIComponent(
    moodleEnv.keycloakRealm,
  )}/protocol/openid-connect/token`;

  const form = new URLSearchParams({
    grant_type: 'password',
    client_id: moodleEnv.keycloakClientId,
    username: moodleEnv.keycloakBotUser,
    password: moodleEnv.keycloakBotPass,
    scope: 'openid profile',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(
      `Keycloak token mint failed: ${res.status} ${res.statusText} — ${text}. ` +
        `(invalid_grant 'not fully set up' → password is Temporary; ` +
        `'not allowed for direct access grants' → enable Direct Access Grants; ` +
        `invalid creds → check KEYCLOAK_BOT_USER/PASS.)`,
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
  };
  return { token: data.access_token, ttlMs: (data.expires_in ?? 300) * 1000 };
}

/**
 * Returns a valid rangeos-api bearer token (raw JWT, no "Bearer " prefix).
 * Uses RANGEOS_API_JWT override if set, else mints+caches from bot creds.
 */
export async function getRangeosApiToken(): Promise<string> {
  const override = moodleEnv.rangeosApiJwtOverride;
  if (override) return override.replace(/^Bearer\s+/i, '');

  // Re-use cached token until ~30s before expiry.
  if (cached && Date.now() < cached.expiresAt - 30_000) {
    return cached.token;
  }

  const { token, ttlMs } = await mintFromKeycloak();
  cached = { token, expiresAt: Date.now() + ttlMs };
  console.log('[keycloakToken] minted rangeos-api token from bot creds');
  return token;
}
