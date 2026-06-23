import { test, expect } from '../fixtures/moodle-course-fixture';
import { SCENARIO_READY_TIMEOUT as READY_TIMEOUT } from '../lms/scenarioReady';
import {
  deployTeamScenario,
  waitForClassDeploymentReady,
  waitForDeployedScenarioReady,
} from '../lms/deployClassScenario';

const TEAM_SCENARIO_NAME = 'e2e-basic-team';

/**
 * Team Scenario tests — one shared instance multiple users connect to.
 *
 * Scenario:Team authors a `:::consoles` directive (ActivityType CONSOLES,
 * teamSSOEnabled). It renders via TeamScenarioExercise — a DIFFERENT player
 * path than the individual/class ScenarioConsoles. Like class, it does NOT
 * auto-deploy: the player scans the launched (SSO) user's ranges for a
 * deployed scenario matching the directive's uuid/name and errors ("No
 * deployed scenario found...") if none exists. Unlike class, there is NO
 * "Enter Class" prompt — the lookup is automatic.
 *
 * So the test mirrors class but simpler: deploy the team scenario via API,
 * wait for the deploy job to Complete, launch, and the player finds + connects.
 *
 *
 * Test-ids on TeamScenarioExercise:
 *   team-scenario        — the team activity root
 *   team-scenario-error  — the "No deployed scenario found" alert
 *   team-scenario-ready  — present once a deployed scenario is found
 *   (console button/popup reuse scenario-console-button / scenario-console-popup
 *    + data-connected, shared via ConsoleButton/ConsolePopup)
 */

test.describe('team scenario @scenario @slow', () => {
  test.use({
    auName: 'Scenario:Team',
    // Team scenarios need a Keycloak SSO session before launch — the player
    // does `login-required`, whose login form can't render inside the launch
    // iframe, so we pre-establish the session (silent auth thereafter).
    requireKeycloakSso: true,
    // CRITICAL: deploy + wait-until-Ready BEFORE the player launches. The team
    // player scans the user's ranges for the deployment ONCE on launch (no
    // retry), so a deploy that happens after launch — or that's still
    // provisioning (the deploy JOB completing ≠ the scenario being Ready) —
    // yields "No deployed scenario found". We deploy here, then wait for the
    // scenario itself to report Ready, then the fixture launches.
    preLaunch: {
      run: async () => {
        const { jobUuid } = await deployTeamScenario();
        if (!jobUuid) throw new Error('team deploy returned no job uuid');
        await waitForClassDeploymentReady(jobUuid, { timeoutMs: READY_TIMEOUT });
        await waitForDeployedScenarioReady(TEAM_SCENARIO_NAME, {
          timeoutMs: READY_TIMEOUT,
        });
      },
    },
  });

  test('team console connects to the shared instance', async ({ player }) => {
    test.setTimeout(READY_TIMEOUT + 120_000);

    // The team activity rendered on launch; the deployment is already Ready
    // (deployed in preLaunch), so the player's range scan found it — NO
    // "no deployed scenario" error.
    await expect(player.getByTestId('team-scenario')).toBeVisible({
      timeout: 30_000,
    });
    await expect(player.getByTestId('team-scenario-error')).toHaveCount(0);

    // The team-ready header renders once the deployed scenario is found.
    await expect(player.getByTestId('team-scenario-ready')).toBeVisible({
      timeout: READY_TIMEOUT,
    });

    // Open the HYPERVISOR console (shared ConsoleButton → ConsolePopup) and
    // confirm the Guacamole tunnel connects to the shared VM.
    const hypervisor = player.getByTestId('scenario-console-button').first();
    await expect(hypervisor).toBeVisible({ timeout: READY_TIMEOUT });
    console.log('[scenario-team] clicking HYPERVISOR');
    await hypervisor.click();

    // First confirm the Guacamole window mounted at all.
    const popup = player.getByTestId('scenario-console-popup');
    await expect(
      popup,
      'the Guacamole console window (scenario-console-popup) should mount',
    ).toBeVisible({ timeout: 60_000 });
    console.log('[scenario-team] console popup mounted; waiting for connect');

    // Then confirm the tunnel reached CONNECTED.
    await expect(
      popup,
      'the team console should connect (data-connected=true)',
    ).toHaveAttribute('data-connected', 'true', { timeout: 90_000 });
  });
});
