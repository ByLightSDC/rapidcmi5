import { test as base, type FrameLocator, type Page } from '@playwright/test';
import { login, gotoActivity, launchAu } from '../moodle/moodleSession';
import { loginToKeycloak } from '../lms/keycloakLogin';
import { moodleEnv } from '../moodle/env';

/**
 * Playwright fixture that logs in as the e2e bot, launches a SPECIFIC AU of
 * the cmi5 activity through real Moodle (`mod/cmi5/launch.php`), and hands the
 * test a `player` scope already on the launched player.
 *
 * The e2e course is organized into functionality-grouped AUs (lessons), each
 * a launchable row in Moodle's Assignable Units table:
 *   - Media:Basic         (Image / Video / Audio)
 *   - Scenario:Individual (one :::scenario slide)
 *   - Scenario:Class      (one :::scenario slide)
 *   - Components:Basic     (tabs / accordion / grid / statements)
 *   - Quiz:Basic           (one :::quiz slide)
 * (Individual and Class scenarios can't live in the same cmi5 lesson, hence
 *  the split — see docs/moodle-player-e2e-strategy.md.)
 *
 * A spec declares which AU it exercises via the `auName` option:
 *
 *   import { test, expect } from '../fixtures/moodle-course-fixture';
 *   test.use({ auName: 'Media:Basic' });
 *   test('…', async ({ player }) => {
 *     await player.getByTestId('player-slide-tab-0').click();
 *   });
 *
 * `player` is a FrameLocator into the launch.php iframe (the player loads
 * embedded — see the spike findings). All player test-ids resolve inside it.
 *
 * No per-test upload: the course is whatever is published to the Moodle
 * activity (`MOODLE_ACTIVITY_ID`). Programmatic provisioning is future work.
 */

interface MoodleOptions {
  /** AU/lesson to launch, by its name in the Assignable Units table. */
  auName: string;
  /**
   * If true, establish a Keycloak browser SSO session (as the bot) BEFORE the
   * Moodle launch. Required for TEAM scenarios (teamSSOEnabled): the player
   * does Keycloak `login-required`, which can't render its login form inside
   * the launch iframe — a pre-existing session makes that auth silent.
   * (Individual/Class use Basic auth and don't need this.)
   */
  requireKeycloakSso: boolean;
  /**
   * Optional async hook run BEFORE the Moodle launch. Required for TEAM
   * scenarios: the player scans the user's ranges for the deployed scenario
   * ONCE on launch (no retry), so the deploy must be Ready before launch — not
   * after (the test body runs after the player has already launched + scanned).
   * (Class doesn't need this: it waits at the "Enter Class" prompt, so the test
   * body can deploy after launch.)
   */
  preLaunch: (() => Promise<void>) | undefined;
}

interface MoodleFixtures {
  /** The launched player's query scope (the launch.php iframe FrameLocator). */
  player: FrameLocator | Page;
}

export const test = base.extend<MoodleOptions & MoodleFixtures>({
  // Default AU; specs override with `test.use({ auName: '…' })`.
  auName: ['Media:Basic', { option: true }],
  requireKeycloakSso: [false, { option: true }],
  preLaunch: [undefined, { option: true }],

  player: async ({ page, auName, requireKeycloakSso, preLaunch }, use) => {
    // The full real flow (login → activity → launch → iframe player boot
    // against a live LRS) comfortably exceeds Playwright's 30s default.
    test.setTimeout(90_000);

    // Team scenarios need a Keycloak session BEFORE launch (see option doc).
    if (requireKeycloakSso) {
      await loginToKeycloak(page);
    }

    // Deploy/setup that must complete BEFORE the player launches (team scans
    // on launch, one-shot). Generous timeout — provisioning can take minutes.
    if (preLaunch) {
      test.setTimeout(15 * 60_000);
      await preLaunch();
    }

    await login(page);
    await gotoActivity(page, moodleEnv.activityId);
    const launched = await launchAu(page, auName);

    await use(launched.content());
  },
});

export { expect } from '@playwright/test';
