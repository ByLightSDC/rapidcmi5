import { moodleEnv } from '../moodle/env';
import { getRangeosApiToken } from './keycloakToken';

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
 * Per-AU scenario UUIDs. Each scenario AU references its OWN RangeOS scenario
 * template so the tests don't collide — sharing one scenario across
 * Individual + Class + Team caused "The AU already has a scenario assigned but
 * it is not available for the class" (an Individual auto-deploy clashing with a
 * Class/Team classId-deployment of the same scenario uuid).
 *
 * These MUST match the uuids the course AUs' directives reference (from the
 * exported e2e-tests.zip):
 *   scenarioindividual → e2e-basic-individual
 *   scenarioclass      → e2e-basic-class
 *   scenarioteam       → e2e-basic-team
 * Env overrides let a re-author swap them without a code change.
 */
export const E2E_INDIVIDUAL_SCENARIO_UUID =
  process.env['E2E_INDIVIDUAL_SCENARIO_UUID']?.trim() ||
  '7511ace6-b0b3-474d-bec6-2238a188edfe'; // e2e-basic-individual

export const E2E_CLASS_SCENARIO_UUID =
  process.env['E2E_CLASS_SCENARIO_UUID']?.trim() ||
  '139dd6bd-d57f-4d8c-ae37-ca4773eda7cc'; // e2e-basic-class

export const E2E_TEAM_SCENARIO_UUID =
  process.env['E2E_TEAM_SCENARIO_UUID']?.trim() ||
  '61da8978-d9f2-4ef5-b8b1-cb9949d2ecd6'; // e2e-basic-team

/** @deprecated kept for any callers; prefer the per-type uuids above. */
export const E2E_SCENARIO_UUID = E2E_INDIVIDUAL_SCENARIO_UUID;

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

/** Minutes until a deployment auto-deletes (expirationAction:'delete'). */
const DEFAULT_EXPIRES_MIN = 30;

/**
 * Shared POST to scenariosDeploy. Returns the queued background-job uuid.
 * (POST /v1/cmi5/scenarios/{uuid}; the deploy is ASYNC — it queues a job and
 * returns { state:'Queued', uuid:<jobUuid>, jobQueue, ... }.)
 */
async function postScenarioDeploy(
  scenarioUuid: string,
  body: Record<string, unknown>,
  label: string,
): Promise<{ jobUuid: string | undefined; response: unknown }> {
  const url = `${moodleEnv.devopsApiUrl.replace(/\/$/, '')}/v1/cmi5/scenarios/${encodeURIComponent(
    scenarioUuid,
  )}`;
  const jwt = await getRangeosApiToken();

  console.log(`[${label}] POST ${url}  ${JSON.stringify(body)}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: jwt, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(
      `${label} failed: ${res.status} ${res.statusText} — ${text}. ` +
        `(If 401/403, the RANGEOS_API_JWT is missing/expired — refresh it.)`,
    );
  }

  const response = (await res.json().catch(() => ({}))) as {
    uuid?: string;
    jobId?: string;
  };
  const jobUuid = response?.uuid ?? response?.jobId;
  console.log(
    `[${label}] queued OK jobUuid=${jobUuid}`,
    JSON.stringify(response).slice(0, 300),
  );
  return { jobUuid, response };
}

/**
 * Deploys the e2e CLASS scenario for a fresh, unique classId and returns it.
 * The caller enters this classId at the player's "Enter Class" prompt.
 */
export async function deployClassScenario(args?: {
  scenarioUuid?: string;
  /** Minutes until the deployment auto-deletes (default 30). */
  expiresInMinutes?: number;
}): Promise<DeployedClass> {
  const scenarioUuid = args?.scenarioUuid ?? E2E_CLASS_SCENARIO_UUID;
  const expiresInMinutes = args?.expiresInMinutes ?? DEFAULT_EXPIRES_MIN;

  // Unique per run so concurrent/repeated runs never collide on seats.
  const classId = `e2e-${Date.now()}`;
  const endDate = new Date(
    Date.now() + expiresInMinutes * 60 * 1000,
  ).toISOString();

  const { jobUuid, response } = await postScenarioDeploy(
    scenarioUuid,
    { classId, count: 1, endDate, expirationAction: 'delete' },
    'deployClassScenario',
  );
  return { classId, jobUuid, response };
}

/**
 * Deploys the e2e TEAM scenario (one shared instance multiple users connect to)
 * and returns the queued job uuid + the classId used.
 *
 * The scenariosDeploy endpoint REQUIRES classId even for team (400
 * REQUIRED_VALIDATION_ERROR otherwise). Unlike class there's no "Enter Class"
 * prompt — the player (TeamScenarioExercise) finds the deployment by scanning
 * the launched SSO user's ranges for a scenario matching the directive's
 * uuid/name, not by classId. So we still pass a unique classId to satisfy the
 * API; it's just not entered anywhere.
 */
export async function deployTeamScenario(args?: {
  scenarioUuid?: string;
  expiresInMinutes?: number;
}): Promise<{ classId: string; jobUuid: string | undefined; response: unknown }> {
  const scenarioUuid = args?.scenarioUuid ?? E2E_TEAM_SCENARIO_UUID;
  const expiresInMinutes = args?.expiresInMinutes ?? DEFAULT_EXPIRES_MIN;
  const classId = `e2e-team-${Date.now()}`;
  const endDate = new Date(
    Date.now() + expiresInMinutes * 60 * 1000,
  ).toISOString();

  const { jobUuid, response } = await postScenarioDeploy(
    scenarioUuid,
    { classId, count: 1, endDate, expirationAction: 'delete' },
    'deployTeamScenario',
  );
  return { classId, jobUuid, response };
}

/**
 * Polls until a deployed scenario with `scenarioName` reports status "Ready"
 * (queryable via GET /v1/cmi5/scenarios?name=). The deploy background JOB
 * completing only means the deploy was SCHEDULED — the scenario/VM keeps
 * provisioning after (the dashboard shows an hourglass). The team player scans
 * for the deployment ONCE on launch with no retry, so we must wait for it to
 * actually be Ready BEFORE launching. Returns when at least one matching
 * deployment is Ready.
 */
export async function waitForDeployedScenarioReady(
  scenarioName: string,
  opts?: { timeoutMs?: number; pollMs?: number },
): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? 12 * 60_000;
  const pollMs = opts?.pollMs ?? 5_000;
  const url = `${moodleEnv.devopsApiUrl.replace(/\/$/, '')}/v1/cmi5/scenarios?name=${encodeURIComponent(
    scenarioName,
  )}`;

  const deadline = Date.now() + timeoutMs;
  let lastStatuses = '(none)';
  while (Date.now() < deadline) {
    const jwt = await getRangeosApiToken();
    const res = await fetch(url, { headers: { Authorization: jwt } });
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as {
        data?: Array<{ status?: string }>;
      } | null;
      const recs = data?.data ?? [];
      lastStatuses = recs.map((r) => r.status).join(',') || '(empty)';
      if (recs.some((r) => r.status === 'Ready')) {
        console.log(
          `[waitForDeployedScenarioReady] ${scenarioName} is Ready`,
        );
        return;
      }
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error(
    `Deployed scenario "${scenarioName}" not Ready within ${timeoutMs}ms (last statuses: ${lastStatuses}).`,
  );
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
  const jwt = await getRangeosApiToken();
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
