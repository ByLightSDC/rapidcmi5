import { moodleEnv } from '../moodle/env';

/**
 * Deploys a class scenario via the RangeOS devops API — the programmatic
 * equivalent of an instructor using the dashboard's "Deploy Scenarios" form.
 *
 * Endpoint (confirmed from the dashboard's real request):
 *   POST {DEVOPS_API_URL}/v1/cmi5/scenarios/{scenarioUUID}
 *   Authorization: <Keycloak JWT>
 *   body: { classId, count, endDate, expirationAction }
 *   (matches devops-api's Cmi5ScenariosApi.scenariosDeploy /
 *    ScenariosDeployRequest)
 *
 * A class scenario must be deployed against a `classId` BEFORE a student can
 * launch the Scenario:Class AU and enter that same class id at the "Enter
 * Class" prompt. Teardown is automatic: `expirationAction: 'delete'` + a
 * near-future `endDate` means the deployment cleans itself up, so no separate
 * teardown call is needed.
 */

/**
 * The scenario UUID to deploy. Both Scenario:Individual and Scenario:Class in
 * the e2e course reference this same `test-console` scenario (they differ only
 * by promptClass); the value comes from the course config
 * (compiled_course/blocks/e2e-tests/scenarioclass/config.json → uuid).
 */
export const E2E_SCENARIO_UUID = '63644278-6431-4ba9-b891-acb52c49fcf0';

export interface DeployedClass {
  /** The unique class id used for this deployment (enter it at the prompt). */
  classId: string;
  /**
   * The background-job uuid for the async deploy (scheduleCmi5Class). The
   * deploy POST only QUEUES the job; poll waitForClassDeploymentReady(jobUuid)
   * until it Completes before entering the class id.
   */
  jobUuid: string | undefined;
  /** Raw API response. */
  response: unknown;
}

/**
 * Deploys the e2e class scenario for a fresh, unique classId and returns it.
 * The caller enters this classId at the player's "Enter Class" prompt.
 */
export async function deployClassScenario(args?: {
  scenarioUuid?: string;
  /**
   * Minutes until the deployment auto-deletes (default 30). With
   * expirationAction: 'delete' the backend tears the deployment down at
   * endDate, so a short window keeps test deployments from piling up — they
   * self-clean ~30 min after a run. Long enough for the test to deploy +
   * connect; raise it if a slow backend run risks expiring mid-test.
   */
  expiresInMinutes?: number;
}): Promise<DeployedClass> {
  const scenarioUuid = args?.scenarioUuid ?? E2E_SCENARIO_UUID;
  const expiresInMinutes = args?.expiresInMinutes ?? 30;

  // Unique per run so concurrent/repeated runs never collide on seats.
  const classId = `e2e-${Date.now()}`;
  const endDate = new Date(
    Date.now() + expiresInMinutes * 60 * 1000,
  ).toISOString();

  const url = `${moodleEnv.devopsApiUrl.replace(/\/$/, '')}/v1/cmi5/scenarios/${encodeURIComponent(
    scenarioUuid,
  )}`;

  // Accept the JWT pasted either raw or with a "Bearer " prefix — send it as
  // the header expects (the dashboard's working request used the raw JWT).
  const jwt = moodleEnv.rangeosApiJwt.replace(/^Bearer\s+/i, '');

  console.log(
    `[deployClassScenario] POST ${url}  classId=${classId} endDate=${endDate}`,
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: jwt,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      classId,
      count: 1,
      endDate,
      expirationAction: 'delete',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(
      `Class scenario deploy failed: ${res.status} ${res.statusText} — ${text}. ` +
        `(If 401/403, the RANGEOS_API_JWT is missing/expired — refresh it.)`,
    );
  }

  const response = (await res.json().catch(() => ({}))) as {
    uuid?: string;
    jobId?: string;
  };
  // The deploy queues a background job; its uuid is what we poll for
  // completion. (Response shape: { ..., jobQueue, state:'Queued', uuid }.)
  const jobUuid = response?.uuid ?? response?.jobId;
  console.log(
    `[deployClassScenario] queued OK classId=${classId} jobUuid=${jobUuid}`,
    JSON.stringify(response).slice(0, 300),
  );
  return { classId, jobUuid, response };
}

/**
 * Polls the async deploy's background job until it Completes, so the test
 * enters the Class Id at the prompt only AFTER the scenario is provisioned.
 *
 * The deploy POST QUEUES a `scheduleCmi5Class` background job and returns its
 * uuid. We poll GET {DEVOPS_API_URL}/v1/background-jobs/{uuid} until
 * state === 'Completed' (BackgroundJobStateEnum: Queued/Running/Completed/
 * Failed), failing fast on 'Failed'.
 */
export async function waitForClassDeploymentReady(
  jobUuid: string,
  opts?: { timeoutMs?: number; pollMs?: number },
): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? 10 * 60_000;
  const pollMs = opts?.pollMs ?? 5_000;
  const jwt = moodleEnv.rangeosApiJwt.replace(/^Bearer\s+/i, '');
  const url = `${moodleEnv.devopsApiUrl.replace(/\/$/, '')}/v1/background-jobs/${encodeURIComponent(
    jobUuid,
  )}`;

  const deadline = Date.now() + timeoutMs;
  let lastState = '(none)';
  while (Date.now() < deadline) {
    const res = await fetch(url, { headers: { Authorization: jwt } });
    if (res.ok) {
      const job = (await res.json().catch(() => null)) as {
        state?: string;
        history?: Array<{ message?: string }>;
      } | null;
      lastState = job?.state ?? '(no-state)';
      if (lastState === 'Completed') {
        console.log(`[waitForClassDeploymentReady] job ${jobUuid} Completed`);
        return;
      }
      if (lastState === 'Failed') {
        const msg = job?.history?.slice(-1)[0]?.message ?? '';
        throw new Error(
          `Class deploy job ${jobUuid} Failed. ${msg}`.trim(),
        );
      }
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error(
    `Class deploy job ${jobUuid} did not Complete within ${timeoutMs}ms (last state: "${lastState}").`,
  );
}
