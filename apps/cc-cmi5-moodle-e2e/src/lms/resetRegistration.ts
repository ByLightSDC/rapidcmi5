import { moodleEnv } from '../moodle/env';

/**
 * Resets the bot's cmi5 registration state for the e2e activity so each run
 * starts from a clean "Not started" AU state.
 *
 * WHY THIS IS NEEDED: the course upsert (`npm run upload:moodle` →
 * local_rapidcmi5_deploy_package) preserves the activity's cmid IN PLACE — which
 * is what stops the activity-id churn — but as a side effect it ALSO preserves
 * the learner's cmi5 registration/LRS progress (progress is keyed on cmid+user,
 * not the package version). So after the first run, each scenario AU shows
 * "Satisfied" and the player RESUMES the completed AU, auto-advancing past the
 * scenario console straight to the End Slide. The scenario flow never re-engages.
 *
 * mod_cmi5 exposes `mod_cmi5_reset_registration_state(cmid, userid)` which clears
 * sessions/tokens/statements/au_status/block_status/state_documents but KEEPS the
 * registration record, so the next launch is a fresh session. We call it before
 * launching so every run is a clean slate. All AUs under the one activity (cmid)
 * share the registration, so a single reset clears the whole activity.
 *
 * ⚠️ REQUIRES `mod_cmi5_reset_registration_state` on a WS service the reset token
 * can reach. The built-in "RapidCMI5 Integration" service is plugin-defined and
 * can't be edited in the Moodle UI, so this function lives on a separate CUSTOM
 * service with its own token (MOODLE_RESET_WS_TOKEN; falls back to
 * MOODLE_WS_TOKEN). If the function isn't on the token's service the call errors
 * "accessexception".
 */

const WS_PATH = '/webservice/rest/server.php';

/** Moodle returns HTTP 200 even on failure, with the error in the body. */
function assertNoMoodleError(data: unknown, op: string): void {
  if (
    data &&
    typeof data === 'object' &&
    ('exception' in data || 'errorcode' in data)
  ) {
    const d = data as { errorcode?: string; message?: string };
    throw new Error(
      `Moodle ${op} failed: ${d.errorcode ?? 'error'} — ${
        d.message ?? JSON.stringify(data)
      }`,
    );
  }
}

async function postWs(
  wsfunction: string,
  fields: Record<string, string>,
): Promise<unknown> {
  const url = `${moodleEnv.baseUrl.replace(/\/$/, '')}${WS_PATH}`;
  const body = new URLSearchParams();
  body.append('wstoken', moodleEnv.resetWsToken);
  body.append('wsfunction', wsfunction);
  body.append('moodlewsrestformat', 'json');
  for (const [k, v] of Object.entries(fields)) body.append(k, v);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json().catch(() => ({}));
  assertNoMoodleError(data, wsfunction);
  return data;
}

/**
 * Resolves the bot's numeric Moodle user id: prefers MOODLE_BOT_USER_ID, else
 * looks it up by username via core_user_get_users_by_field (needs that function
 * on the WS service too). Returns undefined if it can't be determined.
 */
async function resolveBotUserId(): Promise<string | undefined> {
  if (moodleEnv.botUserId) return moodleEnv.botUserId;

  try {
    const data = (await postWs('core_user_get_users_by_field', {
      field: 'username',
      'values[0]': moodleEnv.botUser,
    })) as Array<{ id?: number }>;
    const id = Array.isArray(data) && data[0]?.id;
    if (id) {
      console.log(
        `[resetRegistration] resolved bot userid=${id} via username lookup ` +
          `(set MOODLE_BOT_USER_ID=${id} to skip this lookup)`,
      );
      return String(id);
    }
  } catch (err) {
    console.warn(
      `[resetRegistration] could not look up bot userid by username ` +
        `(${(err as Error).message}). Set MOODLE_BOT_USER_ID explicitly.`,
    );
  }
  return undefined;
}

/**
 * Resets the bot's registration state for the given activity (defaults to the
 * configured e2e activity). No-ops with a warning if the bot userid can't be
 * resolved, so a missing MOODLE_BOT_USER_ID doesn't hard-fail the run (it just
 * runs without a clean slate — useful to surface the misconfig).
 */
export async function resetBotRegistration(
  cmid: string = moodleEnv.activityId,
): Promise<void> {
  const userId = await resolveBotUserId();
  if (!userId) {
    console.warn(
      '[resetRegistration] SKIPPED — no bot userid (set MOODLE_BOT_USER_ID). ' +
        'AUs may resume as already-Satisfied from a prior run.',
    );
    return;
  }

  try {
    await postWs('mod_cmi5_reset_registration_state', {
      cmid: String(cmid),
      userid: userId,
    });
    console.log(
      `[resetRegistration] reset cmid=${cmid} userid=${userId} → clean slate`,
    );
  } catch (err) {
    // "registrationnotfound" is the EXPECTED case when the bot has never
    // launched this activity yet (e.g. a freshly-created/upserted activity, or
    // right after a prior reset) — there is simply nothing to clear, which IS a
    // clean slate. Treat it as a no-op instead of failing the run. Any other
    // error (e.g. accessexception = function not on the service) re-throws.
    const msg = (err as Error).message ?? '';
    if (/registrationnotfound/i.test(msg)) {
      console.log(
        `[resetRegistration] no existing registration for cmid=${cmid} ` +
          `userid=${userId} — already a clean slate`,
      );
      return;
    }
    throw err;
  }
}
