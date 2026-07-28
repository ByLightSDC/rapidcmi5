import { test, expect } from '../fixtures/moodle-course-fixture';
import {
  waitForScenarioReady,
  SCENARIO_READY_TIMEOUT as READY_TIMEOUT,
} from '../lms/scenarioReady';
import {
  deployClassScenario,
  waitForClassDeploymentReady,
} from '../lms/deployClassScenario';

/**
 * Class Scenario tests — the full instructor-deploy → student-launch flow.
 *
 * Scenario:Class authors a `:::scenario` with promptClassId: true. Unlike the
 * Individual scenario (which auto-deploys a VM on launch), a Class scenario
 * does NOT auto-deploy: an instructor must first deploy the scenario against a
 * Class Id (dashboard → Classes → Deploy Scenarios), then the student launches
 * the AU, enters that same Class Id at the "Enter Class" prompt, and reaches
 * the deployed console.
 *
 * We automate the instructor step via the RangeOS devops API
 * (deployClassScenario → POST /v1/cmi5/scenarios/{uuid}) with a unique classId
 * per run; teardown is automatic (expirationAction: 'delete' + endDate).
 *
 * @scenario lane — needs the range backend AND a valid RANGEOS_API_JWT (the
 * dashboard's Keycloak token, pasted into .env.local; it expires).
 */

const SCENARIO_SLIDE = 'player-slide-tab-0';

test.describe('class scenario @scenario @slow', () => {
  test.use({ auName: 'Scenario:Class' });

  // test('class scenario renders the scenario directive', async ({ player }) => {
  //   await player.getByTestId(SCENARIO_SLIDE).click();

  //   const activity = player
  //     .getByTestId('player-slide-content')
  //     .getByTestId('directive-activity');
  //   await expect(activity).toBeVisible({ timeout: 15_000 });
  //   await expect(activity).toHaveAttribute('data-activity-type', 'scenario');
  // });

  // test('class scenario prompts for a Class Id (promptClass path)', async ({
  //   player,
  // }) => {
  //   await player.getByTestId(SCENARIO_SLIDE).click();

  //   // promptClassId: true → the ClassPromptForm appears instead of an
  //   // auto-deployed VM. (Title "Enter Class", a "Class Id" field, "Save".)
  //   const form = player.getByTestId('class-prompt-form');
  //   await expect(form).toBeVisible({ timeout: 20_000 });
  //   await expect(form.getByLabel('Class Id')).toBeVisible();
  //   await expect(player.getByRole('button', { name: 'Save' })).toBeVisible();
  // });

  test('deploy class → enter Class Id → console connects to the VM', async ({
    player,
  }) => {
    test.setTimeout(READY_TIMEOUT + 120_000);

    // Instructor step (automated): deploy the class scenario for a fresh,
    // unique classId. The deploy is ASYNC — it queues a background job and
    // returns its uuid. The student enters this same classId at the prompt.
    const { classId, jobUuid } = await deployClassScenario();
    expect(jobUuid, 'deploy should return a background-job uuid').toBeTruthy();

    // Wait for the deploy job to Complete before entering the id — the "Enter
    // Class" prompt pops immediately on launch, but entering an id for a
    // not-yet-provisioned deployment would fail.
    await waitForClassDeploymentReady(jobUuid as string, {
      timeoutMs: READY_TIMEOUT,
    });

    // The "Enter Class" prompt pops on launch (modal over the slide). Enter
    // the (now-ready) Class Id and submit.
    const form = player.getByTestId('class-prompt-form');
    await expect(form).toBeVisible({ timeout: 30_000 });

    // The MUI TextField has name="classId"; target the actual <input> rather
    // than relying on the floating label association.
    const classIdInput = form.locator('input[name="classId"]');
    await expect(classIdInput).toBeVisible({ timeout: 10_000 });
    await classIdInput.fill(classId);
    await expect(classIdInput).toHaveValue(classId);
    console.log(`[scenario-class] entered classId=${classId}, clicking Save`);

    await player.getByRole('button', { name: 'Save' }).click();

    // The deployed scenario then provisions/attaches a console — same
    // readiness + connection signals as the Individual scenario.
    await waitForScenarioReady(player);

    const hypervisor = player.getByTestId('scenario-console-button').first();
    await expect(hypervisor).toBeVisible({ timeout: READY_TIMEOUT });
    await hypervisor.click();

    const popup = player.getByTestId('scenario-console-popup');
    await expect(popup).toBeVisible({ timeout: 60_000 });
    await expect(popup).toHaveAttribute('data-connected', 'true', {
      timeout: 90_000,
    });
  });
});
