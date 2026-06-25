import { config as loadEnv } from 'dotenv';
import { workspaceRoot } from '@nx/devkit';
import { join } from 'node:path';
import { resetBotRegistration } from './lms/resetRegistration';

/**
 * Playwright global setup — runs ONCE before the whole suite.
 *
 * Resets the bot's cmi5 registration for the e2e activity so the run starts
 * from a clean "Not started" AU state. The course upsert preserves the cmid AND
 * prior progress, so without this a scenario AU resumes as already-"Satisfied"
 * and the player skips the scenario console straight to the End Slide.
 *
 * Why ONCE per run (not before each launch): a registration is per-ACTIVITY
 * (cmi5id) + user, and reset_registration_state clears au_status for ALL AUs
 * under it — so a single reset wipes the whole activity. Doing it before every
 * launch was redundant (N launches = N full resets) and left the last-launched
 * AU cosmetically "in progress". One up-front reset gives every AU a clean
 * first launch within the run.
 *
 * Best-effort: no-ops with a warning if the bot userid can't be resolved, and
 * treats "registrationnotfound" (never launched yet) as already-clean.
 */
async function globalSetup(): Promise<void> {
  // Playwright global setup runs in its own process — load env like the config.
  loadEnv({ path: join(workspaceRoot, '.env.local') });
  loadEnv({ path: join(workspaceRoot, '.env') });

  await resetBotRegistration();
}

export default globalSetup;
