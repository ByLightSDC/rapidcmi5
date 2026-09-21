#!/usr/bin/env node
/**
 * Manually reset the bot's cmi5 registration for the e2e activity — the same
 * clean slate `npm run e2e` gets from global-setup, but on demand so you can
 * emulate a Playwright run by hand in the browser.
 *
 * Usage:
 *   npm run reset:moodle                 # reset the bot on MOODLE_ACTIVITY_ID
 *   npm run reset:moodle -- --cmid 784   # a specific activity
 *   npm run reset:moodle -- --user 42    # a specific Moodle user id
 *
 * Requires in .env.local: MOODLE_BASE_URL, MOODLE_RESET_WS_TOKEN (or
 * MOODLE_WS_TOKEN), and MOODLE_BOT_USER_ID (or MOODLE_BOT_USER for lookup).
 */

const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
require('dotenv').config({ path: path.join(root, '.env.local') });
require('dotenv').config({ path: path.join(root, '.env') });

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const BASE = (process.env.MOODLE_BASE_URL ||
  'https://moodle5.develop-cp.rangeos.engineering').replace(/\/$/, '');
const TOKEN = process.env.MOODLE_RESET_WS_TOKEN || process.env.MOODLE_WS_TOKEN;
const CMID = arg('cmid') || process.env.MOODLE_ACTIVITY_ID || '784';

async function ws(wsfunction, fields) {
  const body = new URLSearchParams({
    wstoken: TOKEN,
    wsfunction,
    moodlewsrestformat: 'json',
    ...fields,
  });
  const res = await fetch(`${BASE}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json().catch(() => ({}));
  // Moodle returns HTTP 200 even on failure, with the error in the body.
  if (data && typeof data === 'object' && ('exception' in data || 'errorcode' in data)) {
    throw new Error(`${wsfunction}: ${data.errorcode || 'error'} — ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

(async () => {
  if (!TOKEN) {
    console.error('✖ Missing MOODLE_RESET_WS_TOKEN (or MOODLE_WS_TOKEN) in .env.local');
    process.exit(1);
  }

  let userId = arg('user') || process.env.MOODLE_BOT_USER_ID;
  if (!userId) {
    const username = process.env.MOODLE_BOT_USER;
    if (!username) {
      console.error('✖ Set MOODLE_BOT_USER_ID, or MOODLE_BOT_USER for lookup, or pass --user <id>');
      process.exit(1);
    }
    const users = await ws('core_user_get_users_by_field', {
      field: 'username',
      'values[0]': username,
    });
    userId = Array.isArray(users) && users[0] && users[0].id;
    if (!userId) {
      console.error(`✖ Could not resolve a Moodle user id for "${username}"`);
      process.exit(1);
    }
    console.log(`  resolved ${username} → userid=${userId} (set MOODLE_BOT_USER_ID=${userId} to skip)`);
  }

  try {
    await ws('mod_cmi5_reset_registration_state', {
      cmid: String(CMID),
      userid: String(userId),
    });
    console.log(`✔ reset cmid=${CMID} userid=${userId} → clean slate (all AUs)`);
  } catch (err) {
    if (/registrationnotfound/i.test(err.message)) {
      console.log(`✔ no existing registration for cmid=${CMID} userid=${userId} — already clean`);
      return;
    }
    console.error('✖', err.message);
    process.exit(1);
  }
})();
