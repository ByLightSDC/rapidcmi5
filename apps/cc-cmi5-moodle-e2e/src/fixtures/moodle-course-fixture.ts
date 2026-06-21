import { test as base, type FrameLocator, type Page } from '@playwright/test';
import { login, gotoActivity, launchAu } from '../moodle/moodleSession';
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
}

interface MoodleFixtures {
  /** The launched player's query scope (the launch.php iframe FrameLocator). */
  player: FrameLocator | Page;
}

export const test = base.extend<MoodleOptions & MoodleFixtures>({
  // Default AU; specs override with `test.use({ auName: '…' })`.
  auName: ['Media:Basic', { option: true }],

  player: async ({ page, auName }, use) => {
    // The full real flow (login → activity → launch → iframe player boot
    // against a live LRS) comfortably exceeds Playwright's 30s default.
    test.setTimeout(90_000);

    await login(page);
    await gotoActivity(page, moodleEnv.activityId);
    const launched = await launchAu(page, auName);

    await use(launched.content());
  },
});

export { expect } from '@playwright/test';
