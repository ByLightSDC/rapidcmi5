import type { FrameLocator, Page } from '@playwright/test';
import { test, expect } from '../fixtures/moodle-course-fixture';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Individual Scenario activity tests — the async, infra-dependent tier.
 *
 * The fixture course's "Individual Scenario" slide (index 7) authors a
 * `:::scenario` directive (test-console, an Ubuntu 22.04 workstation). On
 * launch the player provisions a real VM via the range backend, so unlike
 * the render tests this exercises live infrastructure:
 *
 *   launch → "Loading..." → scenario deployed (status transitions to Ready)
 *          → HYPERVISOR console button available → Guacamole console opens.
 *
 * **@scenario lane — kept OUT of the default run.** These depend on the
 * range backend actually deploying a VM, which can take minutes and can be
 * down. Run them on-demand against a known-healthy backend:
 *   npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario   (grep @scenario)
 *
 * Readiness contract (test-ids added in cc-cmi5-player):
 *   scenario-loading        — "Loading..." box; present until deployed
 *   scenario-header         — deployed scenario header; carries
 *                             data-scenario-status="<lifecycle status>"
 *   scenario-status-icon    — shown only while status !== Ready; its
 *                             ABSENCE is the "ready" signal
 *   scenario-console-button — the HYPERVISOR console button
 *   scenario-console-popup  — the Guacamole console window (#total-container)
 */

const SCENARIO_SLIDE = 'player-slide-tab-7';

// VM provisioning is slow and varies with backend load. Default 10 min,
// override with SCENARIO_READY_TIMEOUT_MS for a slower/faster backend.
const READY_TIMEOUT = Number(
  process.env['SCENARIO_READY_TIMEOUT_MS'] ?? 10 * 60_000,
);

// Scenario lifecycle statuses (from DeployedScenarioDetailStatusEnum):
// Unknown / Ready / NotReady / Creating / Error / Deleting / Stopped.
const TERMINAL_FAILURE_STATUSES = ['Error', 'Stopped', 'Deleting'];

/**
 * Waits for the scenario to reach `Ready`, polling `data-scenario-status` so
 * a timeout reports the status it was STUCK in (e.g. "Creating") rather than
 * a bare locator timeout. Fails fast on a terminal-failure status.
 */
async function waitForScenarioReady(
  player: FrameLocator | Page,
): Promise<void> {
  const header = player.getByTestId('scenario-header');
  // Header appears once the scenario is deployed (status known at all).
  await expect(header).toBeVisible({ timeout: READY_TIMEOUT });

  const deadline = Date.now() + READY_TIMEOUT;
  let lastStatus = '(unknown)';
  while (Date.now() < deadline) {
    lastStatus =
      (await header.getAttribute('data-scenario-status')) ?? '(none)';
    if (lastStatus === 'Ready') return;
    if (TERMINAL_FAILURE_STATUSES.includes(lastStatus)) {
      throw new Error(
        `Scenario reached terminal status "${lastStatus}" — backend deploy failed/torn down.`,
      );
    }
    await sleep(5_000);
  }
  throw new Error(
    `Scenario did not become Ready within ${READY_TIMEOUT}ms (last status: "${lastStatus}"). ` +
      `If the backend was healthy but slow, raise SCENARIO_READY_TIMEOUT_MS.`,
  );
}

test.describe('individual scenario @scenario @slow', () => {
  test('scenario directive renders with type=scenario', async ({ player }) => {
    await player.getByTestId(SCENARIO_SLIDE).click();

    const activity = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toBeVisible({ timeout: 15_000 });
    await expect(activity).toHaveAttribute('data-activity-type', 'scenario');
  });

  test('scenario deploys and becomes ready (no error/loading state)', async ({
    player,
  }) => {
    test.setTimeout(READY_TIMEOUT + 60_000);
    await player.getByTestId(SCENARIO_SLIDE).click();

    await waitForScenarioReady(player);

    // Once Ready: "Loading..." is gone and the provisioning/error status icon
    // (shown only while status !== Ready) is no longer present.
    await expect(player.getByTestId('scenario-loading')).toHaveCount(0);
    await expect(player.getByTestId('scenario-status-icon')).toHaveCount(0);
    await expect(player.getByTestId('scenario-header')).toHaveAttribute(
      'data-scenario-status',
      'Ready',
    );
  });

  test('HYPERVISOR console opens a Guacamole window', async ({ player }) => {
    test.setTimeout(READY_TIMEOUT + 60_000);
    await player.getByTestId(SCENARIO_SLIDE).click();

    await waitForScenarioReady(player);

    const hypervisor = player.getByTestId('scenario-console-button').first();
    await expect(hypervisor).toBeVisible({ timeout: READY_TIMEOUT });
    await hypervisor.click();

    // The Guacamole console window mounts.
    await expect(
      player.getByTestId('scenario-console-popup'),
    ).toBeVisible({ timeout: 60_000 });
  });

  test('HYPERVISOR console connects to the VM (login screen reached)', async ({
    player,
  }) => {
    test.setTimeout(READY_TIMEOUT + 120_000);
    await player.getByTestId(SCENARIO_SLIDE).click();

    await waitForScenarioReady(player);

    const hypervisor = player.getByTestId('scenario-console-button').first();
    await expect(hypervisor).toBeVisible({ timeout: READY_TIMEOUT });
    await hypervisor.click();

    const popup = player.getByTestId('scenario-console-popup');
    await expect(popup).toBeVisible({ timeout: 60_000 });

    // The Guacamole tunnel reaching CONNECTED means the VM display (the Ubuntu
    // login screen) is live — not just that the window opened. We can't assert
    // the login text itself because Guacamole paints into a <canvas> (pixels,
    // no queryable DOM), so the connection-state attribute is the signal.
    await expect(popup).toHaveAttribute('data-connected', 'true', {
      timeout: 90_000,
    });

    // Sanity: the Guacamole display canvas attached and has real dimensions
    // (a painted login screen), not a 0x0 / absent canvas.
    const canvas = popup.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });
});
