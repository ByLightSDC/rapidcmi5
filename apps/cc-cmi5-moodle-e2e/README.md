# Moodle-Launched Playwright E2E Tests

## 1. Goal — Create an e2e framework that allows verification of core functionality on predefined cmi5 course(s) usage via Moodle.

This will allow testing scenarios, LRS, resumes etc. more accurately than trying strictly frontend or local-only tests.

| Use Case |
| --- |
| Export e2e tests from cmi5 player |
| Upload course zip to e2e bot account |
| Setup `.env.local` according to docs below then launch tests in Playwright |

```bash
MOODLE_BOT_USER=e2e-rc5-bot
MOODLE_BOT_PASS=e2e-RC5-@-botman-928
MOODLE_ACTIVITY_ID=779
```

We DO have upsert support now:

```bash
npm run upload:moodle -- --zip "C:/path/to/e2e-tests.zip"
```

## 2. Project layout

```text
apps/cc-cmi5-moodle-e2e/
  playwright.config.ts        # No webServer — Moodle is a remote, running site
  project.json                # Nx targets + run configurations (see §7)
  scripts/
    upload-zip-to-moodle.js   # Standalone course-zip upserter (see §6)
  src/
    e2e/                      # The specs
      media-basic.spec.ts        # Image / Video / Audio slides
      components-basic.spec.ts   # tabs / accordion / grid / statements / quote / table
      quiz-basic.spec.ts         # quiz render + scoring (real LRS)
      scenario.spec.ts           # Scenario:Individual (auto-deploy, full chain)
      scenario-class.spec.ts     # Scenario:Class (deploy via API + class prompt)
      scenario-team.spec.ts      # Scenario:Team (shared SSO instance)
    fixtures/
      moodle-course-fixture.ts  # The `player` fixture: login → launch AU → hand back the iframe scope
    moodle/
      env.ts                    # Validated env access (all config in one place)
      moodleSession.ts          # login(), gotoActivity(), launchAu()
    lms/                        # RangeOS/Keycloak helpers for the scenario lane
      deployClassScenario.ts    # Deploy class/team scenarios via the devops API + wait-for-ready
      keycloakToken.ts          # Mint the rangeos-api JWT via Keycloak password grant
      keycloakLogin.ts          # Establish a Keycloak browser SSO session (team scenarios)
      scenarioReady.ts          # waitForScenarioReady() — polls the player's status
```

### How a spec works

A spec declares which AU (lesson) it launches via the `auName` option, then
queries the player through the `player` fixture:

```ts
import { test, expect } from '../fixtures/moodle-course-fixture';

test.use({ auName: 'Media:Basic' });

test('Image slide renders an <img>', async ({ player }) => {
  await player.getByTestId('player-slide-tab-0').click();
  await expect(player.getByTestId('player-slide-content').locator('img')).toBeVisible();
});
```

`player` is a Playwright `FrameLocator` into Moodle's `launch.php` iframe.
All player test-ids (`player-slide-*`, `directive-*`, `scenario-*`, …) resolve
inside it. The fixture does the whole real flow first — bot login → open the cmi5
activity → click the AU's Launch link → resolve the embedded player — so the
test body starts already on the launched player.

## 3. Initial tests covered

The e2e course is split into functionality-grouped AUs (each a launchable row
in Moodle's Assignable Units table). Individual and Class scenarios can't share a
cmi5 lesson, which is the main reason for the split.

| AU (`auName`) | Spec | What it verifies |
| --- | --- | --- |
| `Media:Basic` | `media-basic.spec.ts` | Image `<img>`, Video `<video>`, Audio `<audio>` slides render |
| `Components:Basic` | `components-basic.spec.ts` | tabs, accordion, layout grid, statements, quote admonition, table — render + fixture content |
| `Quiz:Basic` | `quiz-basic.spec.ts` | quiz directive renders; submit → score 100% / 0% via real LRS; Review Answers hint |
| `Scenario:Individual` | `scenario.spec.ts` | auto-deploys a VM on launch → reaches Ready → HYPERVISOR console connects (Guacamole) |
| `Scenario:Class` | `scenario-class.spec.ts` | deploy a class scenario via API → "Enter Class" prompt → console connects |
| `Scenario:Team` | `scenario-team.spec.ts` | deploy a shared team instance via API + Keycloak SSO → console connects |

**Two lanes:**

- **Content lane** (Media / Components / Quiz) — fast, no infra. The default run.
- **`@scenario` lane** (Individual / Class / Team) — slow, depends on RangeOS
  deploying real VMs (minutes, can be down). Kept out of the default run and
  invoked on demand (see §7).

Scenario tests do the whole chain in one launch. Each scenario AU
auto-completes and caches a cmi5 session on launch; re-launching the same
scenario AU in a later test resumes that satisfied registration and never
re-deploys (it gets stuck "never Ready"). So each scenario spec is a single
comprehensive test — render → deploy → Ready → connect — rather than several
tests that each re-launch. (This can and likely will change when we test resuming etc.)

## 4. How the e2e course is created / updated

The course content is authored in the RapidCMI5 editor, and broken down into
lessons to test different functionality. The e2e repo is at
<https://gitlab.global.rangeos.engineering/metova-cmi5-builder/team-2/e2e-tests.git>
and can be imported into the editor. (Anyone with team-2 access should be already set up.)

A scenario for each test type should be created with each scenario having a
consistent naming convention i.e. `e2e-<typeoftest>-<testdetails>`.

### Critical: the zip must bundle a PRODUCTION player build

The player bundled into the course zip is what runs inside Moodle. Two
requirements:

1. **It must be a production build.** A dev build 404s its `vendor.js` and the
   player iframe renders blank.
2. **It must carry the test-id contract the specs query** (`player-slide-*`,
   `directive-*`, `scenario-*`, `team-scenario-*`, `data-connected`, …). These
   live in the `cc-cmi5-player` source; if the bundled player predates a test-id,
   the matching spec can't find it.

**Authoring / refresh flow:**

1. Build the production player and stage it for the editor:
   ```bash
   npm run build:player-for-editor
   ```
   (→ `scripts/buildCmi5PlayerForEditor.sh`: prod build, hashed chunks,
   vendorChunk off, zipped, copied into the editor's assets)
2. In the editor UI, (re-)export the e2e course → `e2e-tests.zip`
   (this embeds the freshly-built player).
3. Upload the zip to Moodle (see §5).

## 5. Getting the course into Moodle — today vs. the planned upsert

### Today (manual)

1. In Moodle: delete the existing cmi5 activity, create a new one, upload the zip.
2. The new activity gets a NEW id (the `id` in `mod/cmi5/view.php?id=<id>`).
3. Update `MOODLE_ACTIVITY_ID` in `.env.local` to that new id.

The pain: the activity id churns on every re-upload, so `.env.local` must be
updated each time, and a stale/forgotten id silently points the suite at the
wrong activity (or even an unrelated course).

### Planned — one-click / scripted upsert (update-in-place)

The goal is to upsert the existing activity instead of delete-and-recreate, so
the activity id stays stable and `MOODLE_ACTIVITY_ID` never has to change.

This is being built two ways:

- A button/action in the editor — export + upload-in-place in one step.
- A standalone script (already in the repo, pending full verification against
  the Moodle plugin).

## 6. Environment values (`.env.local`)

Config is read in one place — `src/moodle/env.ts` — which validates required vars
and supplies sensible defaults for the rest. Secrets live in a gitignored
`.env.local` at the repo root (loaded with precedence over `.env`). Never
commit credentials. See a teammate for passwords and tokens.

```bash
# ── Moodle course upsert (npm run upload:moodle) ───────────────────────────
# Upserts a prebuilt cmi5 zip into Moodle via the local_rapidcmi5 plugin's
# deploy_package WS, updating the activity IN PLACE (preserving its cmid /
# mod/cmi5/view.php?id=) so the activity id stops churning on every re-upload.
# Keyed on the package's courseId IRI (auto-read from the zip's cmi5.xml).
# Usage (only --zip changes per run):
#   npm run upload:moodle -- --zip "C:/path/to/e2e-tests.zip"
#
# WS token on the "RapidCMI5 Integration" service (local_rapidcmi5) with the
# local/rapidcmi5:deploy capability — the existing gitlab-rapidcmi5 admin token
# works. See C:\code\bylight\moodle-mod_rapidcmi5 / its README.
# MOODLE_WS_TOKEN=
# Moodle COURSE CONTAINER id — the `id` in /course/view.php?id=75. This is the
# course the activity is deployed into; NOT the activity/module id.
# MOODLE_COURSE_ID=75
# Course section id (default 0).
# MOODLE_SECTION_ID=0
# Moodle base URL (shared with the e2e suite; default develop-cp).
# MOODLE_BASE_URL=https://moodle5.develop-cp.rangeos.engineering
# Optional: project display name in Moodle (default "E2E Tests").
# MOODLE_ACTIVITY_NAME=E2E Tests

# ── e2e progress reset (clean slate per test run) ──────────────────────────
# The e2e fixture resets the bot's cmi5 registration BEFORE each launch so runs
# start "Not started" (the upsert preserves the cmid AND prior progress, so
# otherwise scenario AUs resume as already-Satisfied and skip to the End Slide).
# Uses mod_cmi5_reset_registration_state. The built-in "RapidCMI5 Integration"
# service can't be edited in the Moodle UI, so create a CUSTOM external service,
# add mod_cmi5_reset_registration_state (+ core_user_get_users_by_field for the
# userid auto-lookup), and mint a token on it → MOODLE_RESET_WS_TOKEN. Falls back
# to MOODLE_WS_TOKEN if both functions ever live on one service.
# MOODLE_RESET_WS_TOKEN=
# The bot's NUMERIC Moodle user id (from the user's profile URL: ...?id=<n>).
# If unset, the fixture tries core_user_get_users_by_field, else skips the reset.
# MOODLE_BOT_USER_ID=
```

### Which vars matter for which run

| Run | Needs |
| --- | --- |
| Content lane (Media / Components / Quiz) | `MOODLE_BASE_URL`, `MOODLE_ACTIVITY_ID`, `MOODLE_BOT_USER`/`PASS` |
| `@scenario` Individual | + nothing extra (auto-deploys via the player itself) |
| `@scenario` Class / Team | + `NX_PUBLIC_DEVOPS_API_URL` and either `RANGEOS_API_JWT` or `KEYCLOAK_BOT_USER`/`PASS` (mint). Team also uses the Keycloak SSO session. |
| Course upload script (§5) | `MOODLE_WS_TOKEN`, `MOODLE_COURSE_ID` |

## 7. Running the tests

Defined as Nx run configurations in `project.json` (target `e2e`). The suite runs
headed locally (to watch the real launch flow) and headless in CI;
`workers: 1` (serialized) because the tests share one remote Moodle course.

### From the command line

```bash
# Default content lane (excludes @scenario)
npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium

# Headed, list reporter, single worker — good for watching/debugging
npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium-debug

# Playwright UI mode (time-travel, pick individual tests)
npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium-ui

# Smoke only (just the @launch-tagged check)
npx nx e2e cc-cmi5-moodle-e2e --configuration=launch

# The slow, infra-dependent @scenario lane (Individual / Class / Team)
npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario

# @scenario headed + list reporter (watch the VM deploy + console connect)
npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario-debug

# Open the last HTML report
npx nx e2e-report cc-cmi5-moodle-e2e
```

> I usually just test manually via the Playwright Test extension.

## 8. Todo / Upcoming Additions

| Todo | Notes |
| --- | --- |
| LMS statement tests | currently none |
| Resume lesson tests | currently none |
| More detailed scenario checks (i.e. autograder etc.) | currently none |
| Quiz runner scenario test | currently none |
| Tests to check scores in Moodle and gradebook | currently none |
| Add upsert support for existing Moodle course update | important since each run needs to be clean |
