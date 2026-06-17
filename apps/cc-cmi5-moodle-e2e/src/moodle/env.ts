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
};
