#!/usr/bin/env node
/**
 * Upsert a prebuilt cmi5 course zip into Moodle via the `local_rapidcmi5`
 * plugin's `deploy_package` web service — the deploy bridge that the RapidCMI5
 * CLI (this repo) is meant to drive.
 *
 * Why this plugin (and not mod_cmi5launch_upload/update): `local_rapidcmi5`
 * (C:\code\bylight\moodle-mod_rapidcmi5) is purpose-built for exactly this.
 * `deploy_package` → `deployment_manager::deploy_to_course` looks up an
 * existing deployment of the project in the course and UPDATES THE ACTIVITY IN
 * PLACE, preserving its cmid (mod/cmi5/view.php?id=<cmid>). So the activity id
 * stops churning on every re-upload. It keys on the package's `courseId` IRI
 * (`project_identifier`), which is more robust than matching by display name.
 *
 * Two web service calls:
 *   1. POST the zip to /webservice/upload.php  → returns a draft `itemid`.
 *   2. local_rapidcmi5_deploy_package(draftitemid, project_identifier, version,
 *      deploy_to_courses:[MOODLE_COURSE_ID], section_id) → upserts + returns the
 *      cmid.
 *
 * `project_identifier` is read automatically from the zip's cmi5.xml
 * `<course id="…">` (the courseId IRI) — no manual value needed.
 *
 * Run from repo root (the `npm run upload:moodle` wrapper does this):
 *   npm run upload:moodle -- --zip "C:/Users/mattk/Downloads/e2e-tests.zip"
 *
 * Config (mostly from .env.local; only --zip changes per run):
 *   MOODLE_WS_TOKEN       (required) token on the "RapidCMI5 Integration"
 *                         service with local/rapidcmi5:deploy (e.g. the
 *                         existing gitlab-rapidcmi5 admin token).
 *   MOODLE_COURSE_ID      (required) the MOODLE COURSE CONTAINER id — the `id`
 *                         in /course/view.php?id=75 — NOT the activity id.
 *   MOODLE_BASE_URL       (default develop-cp)
 *   MOODLE_SECTION_ID     (default 0)
 *   --zip <path>          (required) the prebuilt cmi5 zip
 *   --version <str>       (optional) defaults to a build timestamp
 *   --project-id <iri>    (optional) overrides the courseId read from cmi5.xml
 */

const path = require('node:path');
const fs = require('node:fs');

// Load repo-root env (.env.local precedence, like the Playwright config).
const repoRoot = path.resolve(__dirname, '../../..');
try {
  require('dotenv').config({ path: path.join(repoRoot, '.env.local') });
  require('dotenv').config({ path: path.join(repoRoot, '.env') });
} catch {
  /* dotenv optional; env may already be set */
}

// axios + form-data ship with the workspace (used by the builder services).
const axios = require('axios');
const FormData = require('form-data');
// AdmZip is available in the workspace; fall back to a tiny zip reader if not.
let AdmZip;
try {
  AdmZip = require('adm-zip');
} catch {
  AdmZip = null;
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/**
 * Read the cmi5 package's courseId IRI from the zip's cmi5.xml
 * (`<course id="…">`). This is the `project_identifier` deploy_package upserts
 * on, so it must match the package being deployed — reading it from the zip
 * guarantees that.
 */
function readProjectIdentifierFromZip(zipPath) {
  if (!AdmZip) {
    throw new Error(
      'adm-zip is not installed; cannot read cmi5.xml from the zip. ' +
        'Pass --project-id <courseId IRI> explicitly instead.',
    );
  }
  const zip = new AdmZip(zipPath);
  const entry = zip.getEntry('cmi5.xml');
  if (!entry) {
    throw new Error(
      `cmi5.xml not found at the root of ${zipPath}; cannot derive ` +
        `project_identifier. Pass --project-id explicitly.`,
    );
  }
  const xml = entry.getData().toString('utf8');
  const m = xml.match(/<course\s+id="([^"]+)"/i);
  if (!m) {
    throw new Error(
      `No <course id="…"> found in cmi5.xml; pass --project-id explicitly.`,
    );
  }
  return m[1];
}

/** Moodle returns HTTP 200 even on failure, with the error in the body. */
function assertNoMoodleError(data, op) {
  if (data && typeof data === 'object' && (data.exception || data.errorcode)) {
    throw new Error(
      `Moodle ${op} failed: ${data.errorcode ?? 'error'} — ${
        data.message ?? JSON.stringify(data)
      }`,
    );
  }
}

/**
 * Step 1: upload the zip to a Moodle draft area via /webservice/upload.php.
 * Returns the draft itemid for deploy_package.
 */
async function uploadToDraft(endpoint, wstoken, zipPath) {
  const url = `${endpoint}/webservice/upload.php`;
  const form = new FormData();
  form.append('token', wstoken);
  form.append('file_1', fs.createReadStream(zipPath));

  const res = await axios.post(url, form, { headers: form.getHeaders() });
  assertNoMoodleError(res.data, 'upload.php');

  // upload.php returns an array of uploaded file descriptors, each with itemid.
  const files = Array.isArray(res.data) ? res.data : [];
  const itemid = files[0] && files[0].itemid;
  if (!itemid) {
    throw new Error(
      `upload.php did not return a draft itemid. Response: ${JSON.stringify(
        res.data,
      ).slice(0, 400)}`,
    );
  }
  return itemid;
}

/**
 * Step 2: call local_rapidcmi5_deploy_package. Upserts the activity in the
 * course (preserving cmid) and returns the deploy result incl. the cmid(s).
 */
async function deployPackage(endpoint, wstoken, params) {
  const url = `${endpoint}/webservice/rest/server.php`;
  const body = new URLSearchParams();
  body.append('wstoken', wstoken);
  body.append('wsfunction', 'local_rapidcmi5_deploy_package');
  body.append('moodlewsrestformat', 'json');
  body.append('draftitemid', String(params.draftitemid));
  body.append('project_identifier', params.projectIdentifier);
  body.append('project_name', params.projectName ?? '');
  body.append('version', params.version);
  // deploy_to_courses is an array param: deploy_to_courses[0]=<courseid>.
  body.append('deploy_to_courses[0]', String(params.courseId));
  body.append('section_id', String(params.sectionId ?? 0));

  const res = await axios.post(url, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  assertNoMoodleError(res.data, 'deploy_package');
  return res.data;
}

async function main() {
  const zip = arg('zip');
  const endpoint = (
    arg(
      'endpoint',
      process.env.MOODLE_BASE_URL ||
        'https://moodle5.develop-cp.rangeos.engineering',
    ) || ''
  ).replace(/\/$/, '');
  const courseId = arg('course-id', process.env.MOODLE_COURSE_ID);
  const sectionId = Number(arg('section-id', process.env.MOODLE_SECTION_ID ?? '0'));
  const wstoken = process.env.MOODLE_WS_TOKEN;
  // Default version = build timestamp (e.g. 2026.06.24-1532). Override --version.
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const defaultVersion = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(
    now.getDate(),
  )}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const version = arg('version', defaultVersion);
  // project_name is the activity's DISPLAY name (cosmetic — NOT the upsert key;
  // that's project_identifier). Sanitize defensively: strip surrounding quotes
  // and any inline `# comment` that a .env.local line might smuggle in (dotenv
  // doesn't always strip these), so a stray comment can't become the activity
  // name.
  const rawProjectName = arg(
    'project-name',
    process.env.MOODLE_ACTIVITY_NAME || 'E2E Tests',
  );
  const projectName = String(rawProjectName)
    .replace(/\s+#.*$/, '') // drop trailing ` # inline comment`
    .replace(/^["']|["']$/g, '') // drop surrounding quotes
    .trim();

  const missing = [];
  if (!zip) missing.push('--zip');
  if (!wstoken) missing.push('MOODLE_WS_TOKEN (env)');
  if (!courseId) missing.push('--course-id or MOODLE_COURSE_ID');
  if (missing.length) {
    console.error('❌ Missing required:', missing.join(', '));
    process.exit(1);
  }

  const resolvedZip = path.resolve(zip);
  if (!fs.existsSync(resolvedZip)) {
    console.error(`❌ Zip not found: ${resolvedZip}`);
    process.exit(1);
  }

  // project_identifier from the zip's cmi5.xml (or --project-id override).
  let projectIdentifier = arg('project-id');
  if (!projectIdentifier) {
    try {
      projectIdentifier = readProjectIdentifierFromZip(resolvedZip);
    } catch (err) {
      console.error('❌', err.message);
      process.exit(1);
    }
  }

  console.log(`Deploying ${resolvedZip}`);
  console.log(
    `  → ${endpoint}  (project="${projectIdentifier}", course=${courseId}, ` +
      `section=${sectionId}, version=${version})`,
  );

  try {
    console.log('1/2 uploading zip to Moodle draft area…');
    const draftitemid = await uploadToDraft(endpoint, wstoken, resolvedZip);
    console.log(`    draftitemid=${draftitemid}`);

    console.log('2/2 deploy_package (upsert)…');
    const result = await deployPackage(endpoint, wstoken, {
      draftitemid,
      projectIdentifier,
      projectName,
      version,
      courseId,
      sectionId,
    });

    console.log('✅ Done. Response:', JSON.stringify(result, null, 2));

    // Surface the resulting cmid(s) — this is the stable MOODLE_ACTIVITY_ID.
    const deployments = (result && result.deployments) || [];
    for (const d of deployments) {
      if (d.status === 'success') {
        console.log(
          `   → course ${d.courseid}: activity cmid=${d.cmid} ` +
            `(set MOODLE_ACTIVITY_ID=${d.cmid})`,
        );
      } else {
        console.error(`   → course ${d.courseid}: ERROR — ${d.message}`);
      }
    }
    if (result && result.is_new_project) {
      console.log('   (new project created)');
    }
  } catch (err) {
    const detail =
      err.response && err.response.data
        ? JSON.stringify(err.response.data).slice(0, 500)
        : err && err.message
          ? err.message
          : String(err);
    console.error('❌ Deploy failed:', detail);
    process.exit(1);
  }
}

main();
