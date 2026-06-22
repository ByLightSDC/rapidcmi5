/**
 * Centralized, validated access to the Moodle-suite environment.
 *
 * Two distinct auth paths live here (see strategy doc):
 *   - browser login (bot account) — MOODLE_BOT_USER / MOODLE_BOT_PASS
 *   - web-service upload (WS token) — MOODLE_WS_TOKEN  (provisioning, phase 3)
 *
 * Nothing here is committed; CI injects secrets, locally use a gitignored
 * `.env` at the repo root (loaded via `dotenv/config` in playwright.config).
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required env var ${name}. ` +
        `Set it in a gitignored .env at the repo root or as a CI secret. ` +
        `See docs/moodle-player-e2e-strategy.md.`,
    );
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export const moodleEnv = {
  baseUrl: optional(
    'MOODLE_BASE_URL',
    'https://moodle5.develop-cp.rangeos.engineering',
  ),
  /** Bot account used to drive the browser (login + launch). */
  get botUser(): string {
    return required('MOODLE_BOT_USER');
  },
  get botPass(): string {
    return required('MOODLE_BOT_PASS');
  },
  /**
   * cmi5 activity id — the `id` in `mod/cmi5/view.php?id=<id>`.
   * Points at the manually-uploaded e2e course (744, in course container 75)
   * which carries a PRODUCTION player build (with the player-* / directive-*
   * test-ids; a dev build 404s its vendor.js → blank player). Re-uploading
   * manually changes this id — override via MOODLE_ACTIVITY_ID in .env.local.
   * Programmatic update-in-place (phase 3) will keep it stable.
   */
  get activityId(): string {
    return optional('MOODLE_ACTIVITY_ID', '744');
  },

  // --- RangeOS devops API (class-scenario deployment, @scenario lane) ---

  /** rangeos-api base, e.g. https://rangeos-api.develop-cp.rangeos.engineering */
  devopsApiUrl: optional(
    'NX_PUBLIC_DEVOPS_API_URL',
    'https://rangeos-api.develop-cp.rangeos.engineering',
  ),

  /**
   * Optional pre-pasted rangeos-api JWT (a Keycloak access token). If set, it's
   * used as-is. If NOT set, the suite mints one via Keycloak password grant
   * from the bot creds below (preferred — self-renewing, and the deploy user
   * matches the launch user so team-scenario range lookups resolve).
   */
  get rangeosApiJwtOverride(): string | undefined {
    const v = process.env['RANGEOS_API_JWT'];
    return v && v.trim() ? v.trim() : undefined;
  },

  // --- Keycloak (mint the rangeos-api token via password grant) ---
  keycloakUrl: optional(
    'NX_PUBLIC_KEYCLOAK_URL',
    'https://keycloak.global.cloudcents.bylight.com',
  ),
  keycloakRealm: optional('NX_PUBLIC_KEYCLOAK_REALM', 'cloudcents'),
  // rangeos-dashboard is a PUBLIC client with Direct Access Grants enabled, so
  // password grant needs only username+password (no client secret).
  keycloakClientId: optional(
    'NX_PUBLIC_KEYCLOAK_CLIENT_ID',
    'rangeos-dashboard',
  ),
  /** Keycloak bot user (e2e-rc5-bot). Needs rangeos_administrator to deploy. */
  get keycloakBotUser(): string {
    return required('KEYCLOAK_BOT_USER');
  },
  get keycloakBotPass(): string {
    return required('KEYCLOAK_BOT_PASS');
  },
};
