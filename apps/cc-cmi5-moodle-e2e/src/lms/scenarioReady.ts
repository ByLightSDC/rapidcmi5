import { expect, type FrameLocator, type Page } from '@playwright/test';

/**
 * Shared scenario-readiness helpers used by both the Individual and Class
 * scenario specs. Kept out of any *.spec.ts so importing it doesn't pull a
 * spec's tests into another file.
 */

// VM provisioning is slow and varies with backend load. Default 10 min,
// override with SCENARIO_READY_TIMEOUT_MS.
export const SCENARIO_READY_TIMEOUT = Number(
  process.env['SCENARIO_READY_TIMEOUT_MS'] ?? 10 * 60_000,
);

// Scenario lifecycle statuses (DeployedScenarioDetailStatusEnum):
// Unknown / Ready / NotReady / Creating / Error / Deleting / Stopped.
const TERMINAL_FAILURE_STATUSES = ['Error', 'Stopped', 'Deleting'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Waits for the scenario to reach `Ready`, polling `data-scenario-status` so a
 * timeout reports the status it was STUCK in. Fails fast on a terminal status.
 */
export async function waitForScenarioReady(
  player: FrameLocator | Page,
): Promise<void> {
  const header = player.getByTestId('scenario-header');
  await expect(header).toBeVisible({ timeout: SCENARIO_READY_TIMEOUT });

  const deadline = Date.now() + SCENARIO_READY_TIMEOUT;
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
    `Scenario did not become Ready within ${SCENARIO_READY_TIMEOUT}ms (last status: "${lastStatus}"). ` +
      `If the backend was healthy but slow, raise SCENARIO_READY_TIMEOUT_MS.`,
  );
}
