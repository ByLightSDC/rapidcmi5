#!/usr/bin/env node
/**
 * One command for the whole Moodle e2e developer loop.
 *
 * Walks you through the three things that have to happen in order, asking
 * before each so you can skip the expensive ones:
 *
 *   1. Build the player       (default NO  — slow, and only needed if you
 *                              changed the player)
 *   2. Upload the course zip  (default NO  — only needed if the player or the
 *                              course content changed)
 *   3. Run the Playwright tests (default YES)
 *
 * The defaults describe "loop A" from the README — verifying the suite still
 * works, where nothing needs rebuilding. Answering yes to 1 and 2 gives you
 * "loop B", the develop-a-player-change loop.
 *
 * Why this exists: the tests hit REMOTE Moodle. Nothing in the test run picks
 * up local player changes, so editing the player and running the tests without
 * a build+upload silently passes against the OLD player. This script keeps the
 * ordering honest and warns when you're about to do exactly that.
 *
 * Step 2 (export the course from the editor UI) can't be automated — the zip
 * has to bundle the freshly-built player WITH the course content, and that
 * export lives in the editor. The script pauses and tells you to do it.
 *
 * Usage:
 *   npm run e2e                      # interactive prompts
 *   npm run e2e -- --build           # force build (no prompt)
 *   npm run e2e -- --upload          # force upload (no prompt)
 *   npm run e2e -- --all             # build + upload + test, no prompts
 *   npm run e2e -- --no-test         # build/upload only
 *   npm run e2e -- --zip <path>      # explicit zip (else newest in Downloads)
 *   npm run e2e -- --config scenario # any e2e configuration (default chromium)
 *   npm run e2e -- --yes             # accept all defaults, no prompts
 */

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const readline = require('node:readline');
const { spawn } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '../../..');

// ---------------------------------------------------------------- args ----

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(`--${flag}`);
const val = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const opts = {
  all: has('all'),
  yes: has('yes') || has('all'),
  build: has('build') || has('all'),
  upload: has('upload') || has('all'),
  noTest: has('no-test'),
  zip: val('zip'),
  config: val('config', 'chromium'),
};

// ------------------------------------------------------------- helpers ----

const c = {
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

function heading(step, total, title) {
  console.log('');
  console.log(c.b(`── ${step}/${total}  ${title} ` + '─'.repeat(Math.max(0, 46 - title.length))));
}

let rl;
function prompt(question) {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return new Promise((resolve) => rl.question(question, resolve));
}

/** Yes/no with an explicit default. Non-interactive (--yes) takes the default. */
async function confirm(question, defaultYes) {
  const suffix = defaultYes ? c.dim('[Y/n]') : c.dim('[y/N]');
  if (opts.yes) {
    console.log(`${question} ${suffix} ${c.dim(defaultYes ? '→ yes' : '→ no')}`);
    return defaultYes;
  }
  const answer = (await prompt(`${question} ${suffix} `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === 'y' || answer === 'yes';
}

/**
 * Run a command. Rejects on non-zero exit.
 *
 * With `capture`, stdout is teed — still streamed to the terminal so you see
 * progress live, and also returned so we can read values out of it (the upload
 * script prints the resulting cmid, which we need to detect an id change).
 */
function run(cmd, args, label, capture = false) {
  return new Promise((resolve, reject) => {
    console.log(c.dim(`$ ${cmd} ${args.join(' ')}`));
    // shell:true so `npx`/`npm` resolve through .cmd shims on Windows.
    const child = spawn(cmd, args, {
      cwd: repoRoot,
      stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
      shell: true,
    });
    let out = '';
    if (capture && child.stdout) {
      child.stdout.on('data', (chunk) => {
        out += chunk;
        process.stdout.write(chunk);
      });
    }
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(out)
        : reject(new Error(`${label} failed (exit ${code})`)),
    );
  });
}

/**
 * Clear the bot's cmi5 progress for an activity, via the same Moodle WS the
 * Playwright globalSetup uses (mod_cmi5_reset_registration_state).
 *
 * Why here as well: globalSetup only runs when the SUITE runs, and in this
 * script's ordering that is always AFTER the upload. Clearing here means an
 * upload-only run (--no-test) still leaves Moodle clean, and that the clear
 * targets the cmid we actually just deployed.
 *
 * Implemented with plain fetch rather than importing src/lms/resetRegistration.ts
 * — that is TypeScript, which this plain-Node script can't require.
 *
 * Best-effort: failures are reported, not fatal, since globalSetup retries.
 */
async function resetProgress(cmid) {
  const base = (process.env.MOODLE_BASE_URL || '').replace(/\/$/, '') ||
    'https://moodle5.develop-cp.rangeos.engineering';
  const token =
    process.env.MOODLE_RESET_WS_TOKEN || process.env.MOODLE_WS_TOKEN;
  const userid = process.env.MOODLE_BOT_USER_ID;

  if (!token || !userid) {
    console.log(
      c.yellow(
        '  ⚠  Skipping progress clear — need MOODLE_BOT_USER_ID and ' +
          'MOODLE_RESET_WS_TOKEN.',
      ),
    );
    return;
  }

  const body = new URLSearchParams({
    wstoken: token,
    wsfunction: 'mod_cmi5_reset_registration_state',
    moodlewsrestformat: 'json',
    cmid: String(cmid),
    userid: String(userid),
  });

  try {
    const res = await fetch(`${base}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await res.json().catch(() => ({}));
    // Moodle returns HTTP 200 even on failure; the error is in the body.
    if (data && (data.exception || data.errorcode)) {
      // "registrationnotfound" = the bot never launched this activity, so
      // there is nothing to clear. That IS a clean slate.
      if (/registrationnotfound/i.test(String(data.errorcode))) {
        console.log(
          c.dim(`  · no prior progress on cmid=${cmid} — already clean`),
        );
        return;
      }
      throw new Error(`${data.errorcode || 'error'} — ${data.message || ''}`);
    }
    console.log(
      c.green(`  ✓ Cleared progress: cmid=${cmid} userid=${userid}`),
    );
  } catch (err) {
    console.log(c.yellow(`  ⚠  Could not clear progress (${err.message}).`));
    console.log(c.dim('     The test run will retry it in globalSetup.'));
  }
}

/** Newest *.zip in Downloads, preferring names that look like a course export. */
function findNewestZip() {
  const dir = path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(dir)) return null;
  const zips = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.zip'))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, name: f, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  if (!zips.length) return null;
  // Prefer something that smells like the e2e course export, else newest.
  return (zips.find((z) => /e2e/i.test(z.name)) || zips[0]).full;
}

function ago(ms) {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

// ---------------------------------------------------------------- main ----

async function main() {
  console.log('');
  console.log(c.b('  Moodle E2E — developer loop'));
  console.log(
    c.dim('  The tests run against REMOTE Moodle, so player changes are only'),
  );
  console.log(
    c.dim('  visible after a build + upload. See apps/cc-cmi5-moodle-e2e/README.md'),
  );

  // ---- 1. build the player ----
  heading(1, 3, 'Build the player?');
  console.log(
    c.dim('  Only needed if you changed the PLAYER. Takes a few minutes.'),
  );
  const doBuild =
    opts.build || (await confirm('  Build the production player?', false));

  if (doBuild) {
    await run('npm', ['run', 'build:player-for-editor'], 'Player build');
    console.log(c.green('  ✓ Player built and staged into the editor assets.'));
  } else {
    console.log(c.dim('  Skipped.'));
  }

  // ---- 2. upload the course zip ----
  heading(2, 3, 'Upload the course to Moodle?');
  console.log(
    c.dim('  Needed if the player or the course content changed.'),
  );
  if (doBuild) {
    console.log(
      c.yellow(
        '  You just built the player — upload, or the tests use the OLD one.',
      ),
    );
  }
  const doUpload =
    opts.upload || (await confirm('  Upload a course zip to Moodle?', doBuild));

  if (doUpload) {
    if (doBuild) {
      console.log('');
      console.log(c.yellow('  ⚠  First export the course from the editor UI.'));
      console.log(
        c.dim(
          '     The zip must bundle the player you just built WITH the course\n' +
            '     content — only the editor export does that. Building alone is\n' +
            '     not enough.',
        ),
      );
      if (!opts.yes) await prompt(c.dim('     Press Enter once the export has downloaded… '));
    }

    let zip = opts.zip;
    if (!zip) {
      const guess = findNewestZip();
      if (guess) {
        const when = ago(fs.statSync(guess).mtimeMs);
        console.log('');
        console.log(`  Newest zip: ${c.cyan(guess)} ${c.dim(`(${when})`)}`);
        const ok = await confirm('  Use this zip?', true);
        zip = ok ? guess : (await prompt('  Path to zip: ')).trim().replace(/^["']|["']$/g, '');
      } else {
        zip = (await prompt('  Path to zip: ')).trim().replace(/^["']|["']$/g, '');
      }
    }

    if (!zip || !fs.existsSync(path.resolve(zip))) {
      throw new Error(`Zip not found: ${zip || '(none given)'}`);
    }

    const uploadOut = await run(
      'node',
      [path.join(__dirname, 'upload-zip-to-moodle.js'), '--zip', `"${path.resolve(zip)}"`],
      'Course upload',
      true, // capture stdout so we can read back the resulting cmid
    );
    console.log(c.green('  ✓ Course upserted into Moodle.'));

    // The upsert preserves the cmid, but a NEW project (or a changed courseId
    // IRI) yields a new one. If that happens, .env.local is now stale and both
    // the reset below and the tests would target the wrong activity.
    const deployedCmid = (uploadOut.match(/activity cmid=(\d+)/) || [])[1];
    const configuredCmid = process.env.MOODLE_ACTIVITY_ID;
    if (deployedCmid && configuredCmid && deployedCmid !== configuredCmid) {
      console.log('');
      console.log(
        c.red(
          `  ⚠  Activity id changed: deployed cmid=${deployedCmid}, but ` +
            `.env.local has MOODLE_ACTIVITY_ID=${configuredCmid}.`,
        ),
      );
      console.log(
        c.yellow(
          `     Update .env.local to MOODLE_ACTIVITY_ID=${deployedCmid}, ` +
            'or the tests will run against the OLD activity.',
        ),
      );
    }

    // Clear the bot's progress NOW, against the cmid we just deployed — the
    // upsert preserves prior progress, so without this a scenario AU resumes
    // as already-Satisfied. globalSetup does this too, but only if the suite
    // runs, and only against the configured id.
    await resetProgress(deployedCmid || configuredCmid);
  } else {
    console.log(c.dim('  Skipped.'));
    if (doBuild) {
      console.log(
        c.red(
          '  ⚠  You built the player but did NOT upload it. The tests will run\n' +
            '     against the previously-uploaded player — a pass proves nothing\n' +
            '     about your change.',
        ),
      );
    }
  }

  // ---- 3. run the tests ----
  heading(3, 3, 'Run the tests');
  if (opts.noTest) {
    console.log(c.dim('  Skipped (--no-test).'));
  } else {
    const doTest = await confirm(
      `  Run the e2e suite (${c.cyan(opts.config)})?`,
      true,
    );
    if (doTest) {
      if (rl) rl.close(); // release stdin before Playwright takes over
      rl = null;
      await run(
        'npx',
        ['nx', 'e2e', 'cc-cmi5-moodle-e2e', `--configuration=${opts.config}`],
        'Playwright suite',
      );
      console.log(c.green('  ✓ Suite finished.'));
    } else {
      console.log(c.dim('  Skipped.'));
    }
  }

  if (rl) rl.close();
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    if (rl) rl.close();
    console.error('');
    console.error(c.red(`✖ ${err.message}`));
    process.exit(1);
  });
