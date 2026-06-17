import { test as base, type FrameLocator, type Page } from '@playwright/test';
import { login, gotoActivity, launchAu } from '../moodle/moodleSession';
import { moodleEnv } from '../moodle/env';

/**
 * Playwright fixture that logs in as the e2e bot, launches the cmi5
 * activity through real Moodle (`mod/cmi5/launch.php`), and hands the test
 * a `player` scope already on the launched player.
 *
 * This is the Moodle analogue of the player suite's
 * `e2e-tests-course-fixture.ts`. The crucial difference: the player loads
 * **inside an iframe** on launch.php (see the spike findings in
 * docs/moodle-player-e2e-strategy.md), so `player` is a `FrameLocator`,
 * not the top `Page`. All the player test-ids (`player-slide-content`,
 * `player-slide-tab-<n>`, `directive-<name>`, …) resolve inside it.
 *
 * Porting a `cc-cmi5-player-e2e` spec is therefore mechanical:
 *
 *   // before (synthetic player suite):
 *   import { test, expect } from '../fixtures/e2e-tests-course-fixture';
 *   test('…', async ({ page }) => {
 *     await page.getByTestId('player-slide-tab-1').click();
 *   });
 *
 *   // after (real Moodle launch):
 *   import { test, expect } from '../fixtures/moodle-course-fixture';
 *   test('…', async ({ player }) => {
 *     await player.getByTestId('player-slide-tab-1').click();
 *   });
 *
 * The assertions are otherwise identical because the player markup is the
 * same — only the *route to it* changed from a stubbed launch to a real one.
 *
 * Unlike the synthetic suite, there is no per-test fixture upload: the
 * course is whatever is currently published to the Moodle activity
 * (`MOODLE_ACTIVITY_ID`). Programmatic per-run provisioning is phase 3.
 */

interface MoodleFixtures {
  /**
   * The launched player's query scope (a FrameLocator into the launch.php
   * iframe). Use it exactly as you'd use `page` in the synthetic suite.
   */
  player: FrameLocator | Page;
}

export const test = base.extend<MoodleFixtures>({
  // The full real flow (login → activity → launch → iframe player boot
  // against a live LRS) comfortably exceeds Playwright's 30s default.
  player: async ({ page }, use) => {
    // Generous per-test timeout for the launch flow; individual assertions
    // keep their own shorter timeouts.
    test.setTimeout(90_000);

    await login(page);
    await gotoActivity(page, moodleEnv.activityId);
    const launched = await launchAu(page, 0);

    await use(launched.content());
  },
});

export { expect } from '@playwright/test';
