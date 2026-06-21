import { test, expect } from '@playwright/test';
import { login, gotoActivity, launchAu } from '../moodle/moodleSession';
import { moodleEnv } from '../moodle/env';

/**
 * SPIKE — the load-bearing de-risking test (phase 1 of the Moodle strategy).
 *
 * Proves the whole real-launch path works against a manually-uploaded course
 * (737 by default) before we invest in programmatic provisioning:
 *
 *   bot logs into Moodle → opens the cmi5 activity → clicks Launch →
 *   Moodle's launch.php mints a REAL cmi5 launch URL → the player renders.
 *
 * It also answers the two unknowns the rest of the plan depends on:
 *   1. Cross-origin shape — does Moodle launch the player in an iframe or a
 *      popup? `launchAu` handles both and the test logs which one occurred.
 *   2. That the host-agnostic player test-ids (`player-slide-content`,
 *      `player-slide-tab-<n>`) resolve inside the Moodle-launched player
 *      exactly as they do under the synthetic player suite.
 *
 * Unlike the @render suite, there is NO `?fetch=test` here — the launch is
 * real, so this is the first test that exercises the actual cmi5 session.
 *
 * Run headed for the first observation:
 *   npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium-debug
 */

test.describe('Moodle launch @launch', () => {
  // Full real flow — login + activity nav + launch + player boot (the player
  // hydrates progressively against the live LRS) — comfortably exceeds the
  // 30s default. Give it room so a slow-but-successful launch isn't a failure.
  test.setTimeout(90_000);

  test('bot can launch the cmi5 activity and the player renders', async ({
    page,
  }) => {
    await login(page);
    await gotoActivity(page, moodleEnv.activityId);

    // Launch the simplest media lesson; the spike only proves launch mechanics.
    const player = await launchAu(page, 'Media:Basic');

    // Observation for the spike write-up: how did Moodle surface the player?
    // Confirmed `sameTab` against RangeOS Moodle (the Launch link navigates
    // the current tab to launch.php).
    console.log(`[spike] Moodle launched the player as: ${player.shape}`);

    const content = player.content();

    // This spike deliberately drives the raw launch primitives (login /
    // gotoActivity / launchAu) rather than the moodle-course-fixture, so it
    // stays a focused proof that the launch MECHANICS work. The fixture-based
    // smoke / ported specs cover slide content in depth.
    //
    // The deployed course (739) carries the current player build, so the
    // player test-ids are present — assert on those (same contract the
    // ported specs use) plus the slide nav.
    await expect(content.getByTestId('player-slide-content')).toBeVisible({
      timeout: 30_000,
    });
    await expect(content.getByTestId('player-slide-tab-0')).toBeVisible();
  });
});
