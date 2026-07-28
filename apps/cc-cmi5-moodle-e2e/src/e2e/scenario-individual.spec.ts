import { test, expect } from '../fixtures/moodle-course-fixture';
import {
  waitForScenarioReady,
  SCENARIO_READY_TIMEOUT as READY_TIMEOUT,
} from '../lms/scenarioReady';

/**
 * Scenario activity tests — the async, infra-dependent tier.
 *
 * The course has two scenario AUs (they can't share a cmi5 lesson):
 *   - Scenario:Individual — a `:::scenario` that AUTO-DEPLOYS a VM on launch
 *     (promptClass: false). This file covers it end to end.
 *   - Scenario:Class — a `:::scenario` with promptClass: true (prompts for a
 *     Class ID / expects a pre-deployed scenario). Covered separately in
 *     scenario-class.spec.ts (different flow).
 *
 * Each scenario AU has a single slide (Slide 1 = player-slide-tab-0).
 *
 * **@scenario lane — kept OUT of the default run.** Depends on the range
 * backend deploying a VM (minutes, can be down). Run on-demand:
 *   npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario
 *
 * **ONE comprehensive test per launch — deliberate.** Individual AUTO-DEPLOYS a
 * VM keyed by the cmi5 REGISTRATION on launch, then polls for it. We proved
 * that a single launch deploys → reaches Ready → connects Guacamole reliably.
 * But splitting this into several tests that each re-launch the SAME AU FAILS:
 * the first launch completes the AU (sends activityCompleted/Passed) and caches
 * a cmi5 session in sessionStorage, and the next launch resumes that satisfied
 * registration in a way that never re-deploys → stuck "never Ready". Each VM
 * spin-up is also minutes of infra. So we do the whole chain in ONE launch and
 * never re-launch the Individual AU within this file.
 *
 * Readiness contract (player test-ids):
 *   scenario-loading        — "Loading..." box; present until deployed
 *   scenario-header         — deployed header; data-scenario-status="<status>"
 *   scenario-status-icon    — shown only while status !== Ready (absence=ready)
 *   scenario-console-button — HYPERVISOR console button
 *   scenario-console-popup  — Guacamole window (+data-connected on CONNECTED)
 */

// Each scenario AU has one slide.
const SCENARIO_SLIDE = 'player-slide-tab-0';

test.describe('individual scenario @scenario @slow', () => {
  test.use({ auName: 'Scenario:Individual' });

  test('renders, auto-deploys, reaches Ready, and connects the console', async ({
    player,
  }) => {
    test.setTimeout(READY_TIMEOUT + 120_000);
    await player.getByTestId(SCENARIO_SLIDE).click();

    // 1. The scenario directive rendered with the right activity type.
    const activity = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toBeVisible({ timeout: 15_000 });
    await expect(activity).toHaveAttribute('data-activity-type', 'scenario');

    // 2. The auto-deployed VM provisions and the header reaches Ready (no
    //    lingering loading/spinner state).
    await waitForScenarioReady(player);
    await expect(player.getByTestId('scenario-loading')).toHaveCount(0);
    await expect(player.getByTestId('scenario-status-icon')).toHaveCount(0);
    await expect(player.getByTestId('scenario-header')).toHaveAttribute(
      'data-scenario-status',
      'Ready',
    );

    // 3. The HYPERVISOR console opens a Guacamole window...
    const hypervisor = player.getByTestId('scenario-console-button').first();
    await expect(hypervisor).toBeVisible({ timeout: READY_TIMEOUT });
    await hypervisor.click();

    const popup = player.getByTestId('scenario-console-popup');
    await expect(popup).toBeVisible({ timeout: 60_000 });

    // 4. ...and the tunnel reaches CONNECTED — the VM display (Ubuntu login
    //    screen) is live. Can't assert the login text: Guacamole paints into a
    //    <canvas> (pixels, no queryable DOM), so we assert the canvas + the
    //    data-connected flag instead.
    await expect(popup).toHaveAttribute('data-connected', 'true', {
      timeout: 90_000,
    });
    const canvas = popup.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });
});
