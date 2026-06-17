#!/usr/bin/env node
/**
 * Standalone Moodle zip-uploader for the e2e course.
 *
 * Why a script and not the cmi5-builder CLI: `node dist/apps/cmi5-builder/main.js`
 * currently crashes at load (versions.ts does `require('../../package.json')`,
 * which doesn't resolve in the bundled dist — a pre-existing packaging bug,
 * unrelated to this work). The compiled MoodleUploadService, however, loads
 * fine in isolation (its only top-level deps are axios/form-data/fs/path), so
 * we require it directly and bypass the broken entrypoint.
 *
 * Run from repo root, AFTER `npx nx build cmi5-builder`:
 *
 *   MOODLE_WS_TOKEN=... node apps/cc-cmi5-moodle-e2e/scripts/upload-zip-to-moodle.js \
 *     --zip "C:/Users/mattk/Downloads/e2e-tests.zip" \
 *     --endpoint https://moodle5.develop-cp.rangeos.engineering \
 *     --modulename "E2E Tests" \
 *     --course-id <MOODLE_COURSE_ID> \
 *     --section-id 0
 *
 * The repo-root .env.local is loaded, so MOODLE_WS_TOKEN can live there.
 *
 * --modulename MUST match the activity name as stored in Moodle (e.g.
 * "E2E Tests"), or the in-place update won't find the existing activity and
 * will create a new one (new cmid) instead.
 */

const path = require('node:path');

// Load repo-root env (.env.local precedence, like the Playwright config).
const repoRoot = path.resolve(__dirname, '../../..');
try {
  require('dotenv').config({ path: path.join(repoRoot, '.env.local') });
  require('dotenv').config({ path: path.join(repoRoot, '.env') });
} catch {
  /* dotenv optional; env may already be set */
}

const {
  MoodleUploadService,
} = require(
  path.join(
    repoRoot,
    'dist/apps/cmi5-builder/apps/cmi5-builder/src/services/moodle/moodleUploadService.js',
  ),
);

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  const zip = arg('zip');
  const endpoint = arg(
    'endpoint',
    process.env.MOODLE_BASE_URL ||
      'https://moodle5.develop-cp.rangeos.engineering',
  );
  const modulename = arg('modulename', 'E2E Tests');
  const courseId = arg('course-id', process.env.MOODLE_COURSE_ID);
  const sectionId = Number(arg('section-id', process.env.MOODLE_SECTION_ID ?? '0'));
  const wstoken = process.env.MOODLE_WS_TOKEN;

  const missing = [];
  if (!zip) missing.push('--zip');
  if (!wstoken) missing.push('MOODLE_WS_TOKEN (env)');
  if (!courseId) missing.push('--course-id or MOODLE_COURSE_ID');
  if (missing.length) {
    console.error('❌ Missing required:', missing.join(', '));
    process.exit(1);
  }

  console.log(`Uploading ${zip}`);
  console.log(`  → ${endpoint}  (modulename="${modulename}", course=${courseId}, section=${sectionId})`);

  const uploader = new MoodleUploadService({ baseUrl: endpoint, wstoken });
  try {
    const result = await uploader.uploadPrebuiltZip({
      zipPath: path.resolve(zip),
      modulename,
      moodleCourseId: courseId,
      moodleSectionId: sectionId,
    });
    console.log('✅ Done. Response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Upload failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
