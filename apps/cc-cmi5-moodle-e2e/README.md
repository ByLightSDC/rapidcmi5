# Moodle-Launched Playwright E2E Tests

These tests drive the **real** CMI5 player the way a student does: log into
Moodle as a bot account, click an activity's **Launch** button, and assert
against the player running inside Moodle's `launch.php` iframe — against a live
LRS, and (for the scenario lane) real deployed VMs.

**New here? Read §1, copy the env block, run the command. That's it.**
Everything from §4 down is background you only need when something breaks.

---

## 1. Quick start

### First: which loop are you in?

There are two, and they are not the same. Picking the wrong one gives you a
**false pass** — a green suite that never saw your change.

| | **A. Verifying the suite** | **B. Testing a player/course change** |
| --- | --- | --- |
| You are… | checking the tests still work, or debugging a spec | changing the player or the course content |
| Build the player | not needed | **required** |
| Export + upload to Moodle | not needed | **required** |
| Steps below | 1 → 2 → 3 | 1 → 2 → **§5** → 3 |
| One-command version | `npm run e2e` | `npm run e2e -- --all` |

> ⚠️ **Nothing in the test run picks up local player changes.** There is no
> `webServer` in the Playwright config — the tests log into remote Moodle and
> assert inside its `launch.php` iframe. The player running there is whatever
> was last uploaded. So if you edited the player and skipped §5, the suite runs
> against the **old** player and passes green. That is the most expensive
> mistake available here, because nothing fails to warn you.
>
> (`project.json` lists `cc-cmi5-player` under `implicitDependencies`, which
> looks like it would handle this for you. It does not — the `e2e` target has no
> `dependsOn`, so Nx never builds or uploads anything for a test run.)

### Step 0 — Fresh clone only

```bash
npm install
```

### Step 1 — Get the credentials

Ask a teammate for the `.env.local` values (bot password + WS tokens). They are
secrets and are **never** committed.

### Step 2 — Create `.env.local` at the **repo root**

Not in this app folder — the repo root (`rapidcmi5/.env.local`). It is
gitignored and takes precedence over `.env`.

```bash
# --- Required for every run ---------------------------------------------
MOODLE_BASE_URL=https://moodle5.develop-cp.rangeos.engineering
MOODLE_ACTIVITY_ID=784          # the `id` in mod/cmi5/view.php?id=<id>
MOODLE_BOT_USER=e2e-rc5-bot
MOODLE_BOT_PASS=<ask a teammate>

# --- Required so each run starts from a clean slate ----------------------
MOODLE_BOT_USER_ID=30           # the bot's NUMERIC id (profile URL ?id=<n>)
MOODLE_RESET_WS_TOKEN=<ask a teammate>

# --- Only needed for the @scenario lane (§3) -----------------------------
NX_PUBLIC_DEVOPS_API_URL=https://rangeos-api.develop-cp.rangeos.engineering
KEYCLOAK_BOT_USER=<ask a teammate>
KEYCLOAK_BOT_PASS=<ask a teammate>

# --- Only needed to re-upload the course zip (§5) ------------------------
MOODLE_WS_TOKEN=<ask a teammate>
MOODLE_COURSE_ID=75             # course CONTAINER id, not the activity id
```

### Step 3 — Run it

```bash
npm run e2e
```

This walks you through the whole loop, asking before each step so you can skip
the expensive ones:

```text
1/3  Build the player?              [y/N]   ← default NO (slow; only if you changed the player)
2/3  Upload the course to Moodle?   [y/N]   ← default NO (defaults to YES if you built)
3/3  Run the tests?                 [Y/n]   ← default YES
```

Pressing Enter three times is loop A — straight to the tests. Answering yes to
the first two is loop B, and the script keeps the ordering honest: it pauses for
the editor export, auto-finds the newest zip in Downloads (showing its age, so a
stale one is obvious), and warns loudly if you build without uploading.

**On progress clearing.** The upsert preserves the learner's prior progress
(§4), so it has to be cleared or scenario AUs resume as already-"Satisfied".
That clear happens in two places, deliberately:

- **Right after the upload**, in this script, against the cmid that was just
  deployed. This is what makes an upload-only run (`--no-test`) leave Moodle in
  a clean state.
- **Again in `globalSetup`** when the suite starts (§4).

The script also compares the deployed cmid against `MOODLE_ACTIVITY_ID` and
warns if they've diverged — an upsert normally preserves the id, but a new
project or a changed `courseId` IRI produces a new one, which would leave
`.env.local` pointing at the wrong activity.

Non-interactive flags, for when you already know what you want:

```bash
npm run e2e -- --all             # build + upload + test, no prompts
npm run e2e -- --upload          # upload + test (course content changed)
npm run e2e -- --yes             # accept all defaults (= just run the tests)
npm run e2e -- --config scenario # any e2e configuration (default chromium)
npm run e2e -- --zip <path>      # explicit zip instead of auto-detect
npm run e2e -- --no-test         # build/upload only
```

Or drive Nx directly if you prefer:

```bash
npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium
```

That is the whole loop. ~17 tests, ~3 minutes, no infra beyond Moodle itself.
A browser window opens locally so you can watch the real launch flow (headless
in CI).

**Expected result:** `17 passed`. If you get `Missing required env var …`, go
back to Step 2. For anything else, see §6 Troubleshooting.

> **If you changed the player or the course, stop.** A green run here proves
> nothing until you have done §5 — you just tested the previously-uploaded
> player. Go to §5, then come back and re-run this.

### The commands you'll actually use

| I want to… | Command |
| --- | --- |
| **The guided loop** (asks build / upload / test) | `npm run e2e` |
| **The whole loop B, no prompts** | `npm run e2e -- --all` |
| **Run the normal suite** (media + components + quiz) | `npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium` |
| Watch it run / debug it | `npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium-debug` |
| Pick individual tests, time-travel | `npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium-ui` |
| Run just the content tests | `npx nx e2e cc-cmi5-moodle-e2e --configuration=content` |
| Run just the quiz tests | `npx nx e2e cc-cmi5-moodle-e2e --configuration=quizzes` |
| Run the slow VM/scenario tests (§3) | `npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario` |
| Watch the scenario tests deploy VMs | `npx nx e2e cc-cmi5-moodle-e2e --configuration=scenario-debug` |
| See the report from the last run | `npx nx e2e-report cc-cmi5-moodle-e2e` |

You can also run and debug individual tests straight from the **Playwright Test
extension** in VS Code — that's the day-to-day loop for most of us.

> ⚠️ The VS Code extension's side panel **skips `globalSetup`**, so the
> registration reset (§4) does not run there. Tests that depend on a clean
> "Not started" state — the scenario lane especially — can behave differently
> than a CLI run. Use the CLI when that matters.

---

## 2. What gets tested

The e2e course is split into functionality-grouped **AUs** (lessons) — each one
a launchable row in Moodle's Assignable Units table. A spec picks its AU with
`test.use({ auName: '…' })`.

| AU (`auName`) | Spec | Tag | What it verifies |
| --- | --- | --- | --- |
| `Media:Basic` | `media-basic.spec.ts` | `@content` | Image `<img>`, Video `<video>`, Audio `<audio>` slides render |
| `Components:Basic` | `components-basic.spec.ts` | `@content` | tabs, accordion, layout grid, statements, quote admonition, table — render + expected content |
| `Quiz:Basic` | `quiz-basic.spec.ts` | `@quizzes` | quiz renders; submit → 100% / 0% scored via the real LRS; Review Answers hint |
| `Scenario:Individual` | `scenario-individual.spec.ts` | `@scenario` | auto-deploys a VM on launch → reaches Ready → HYPERVISOR console connects (Guacamole) |
| `Scenario:Class` | `scenario-class.spec.ts` | `@scenario` | deploy a class scenario via API → "Enter Class" prompt → console connects |
| `Scenario:Team` | `scenario-team.spec.ts` | `@scenario` | deploy a shared team instance via API + Keycloak SSO → console connects |

Individual and Class scenarios can't live in the same cmi5 lesson, which is the
main reason the course is split this way.

---

## 3. Two lanes: content vs. scenario

**Content lane** (`@content`, `@quizzes`) — Media / Components / Quiz. Fast, no
infrastructure beyond Moodle. **This is the default run** and what you should
use to check "is the player still working."

**`@scenario` lane** — Individual / Class / Team. Slow (minutes), deploys real
VMs through RangeOS, and **can fail for reasons that have nothing to do with
your change** (range backend down, capacity, Keycloak). Deliberately excluded
from the default run; invoke it on demand.

> **Why each scenario spec is one long test.** A scenario AU auto-completes and
> caches a cmi5 session on launch. Re-launching that same AU later resumes the
> satisfied registration and never re-deploys — it just hangs at "never Ready."
> So each scenario spec does the whole chain in a single test (render → deploy →
> Ready → connect) rather than several tests that each re-launch.

---

## 4. How it works

### Project layout

```text
apps/cc-cmi5-moodle-e2e/
  playwright.config.ts          # No webServer — Moodle is a remote, running site
  project.json                  # Nx run configurations (the table in §1)
  scripts/
    e2e-run.js                  # Guided build → upload → test loop (npm run e2e)
    upload-zip-to-moodle.js     # Course-zip upserter (see §5)
  src/
    global-setup.ts             # Runs ONCE per run: resets the bot's progress
    e2e/                        # The specs
      media-basic.spec.ts
      components-basic.spec.ts
      quiz-basic.spec.ts
      scenario-individual.spec.ts
      scenario-class.spec.ts
      scenario-team.spec.ts
    fixtures/
      moodle-course-fixture.ts  # The `player` fixture: login → launch AU → iframe scope
    moodle/
      env.ts                    # Validated env access (all config in one place)
      moodleSession.ts          # login(), gotoActivity(), launchAu()
    lms/                        # RangeOS/Keycloak helpers for the scenario lane
      resetRegistration.ts      # Clears the bot's cmi5 progress via Moodle WS
      deployClassScenario.ts    # Deploy class/team scenarios + wait-for-ready
      keycloakToken.ts          # Mint the rangeos-api JWT (password grant)
      keycloakLogin.ts          # Keycloak browser SSO session (team scenarios)
      scenarioReady.ts          # waitForScenarioReady() — polls player status
```

### How a spec works

```ts
import { test, expect } from '../fixtures/moodle-course-fixture';

test.describe('test basic media @content', () => {
  test.use({ auName: 'Media:Basic' });

  test('Image slide renders an <img>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-0').click();
    await expect(
      player.getByTestId('player-slide-content').locator('img'),
    ).toBeVisible();
  });
});
```

`player` is a Playwright `FrameLocator` into Moodle's `launch.php` iframe. All
player test-ids (`player-slide-*`, `directive-*`, `scenario-*`, …) resolve
inside it. The fixture performs the whole real flow first — bot login → open the
cmi5 activity → click the AU's **Launch** link → resolve the embedded player —
so your test body starts already on a launched player.

### The clean-slate reset

`global-setup.ts` runs **once** before the suite and clears the bot's cmi5
registration (`mod_cmi5_reset_registration_state`), so the run starts from "Not
started."

This matters because the course upsert preserves prior progress: without the
reset, a scenario AU resumes as already-"Satisfied" and the player skips
straight to the End Slide instead of deploying. A registration is
per-activity + user and the reset clears `au_status` for **all** AUs under it,
so one reset covers the whole run.

It is best-effort — it warns and continues if the bot user id can't be resolved,
and treats "never launched yet" as already-clean. You'll see this line on a
successful run:

```
[resetRegistration] reset cmid=784 userid=30 → clean slate
```

### Execution notes

- `workers: 1` — the tests share one remote Moodle course, so they're serialized.
- `retries: 2` — the live player intermittently crashes on launch (a pre-existing
  `"A is not a function"` in `useCMI5Session`'s console-creds path, present on
  main and unrelated to these tests). That blanks the iframe. Retrying
  re-launches rather than red-flagging the suite.

---

## 5. Testing a player or course change (loop B)

**This is the loop you use when you are developing**, not an occasional chore.
Any change to the player or to the course content has to be built, exported and
uploaded before the tests can see it — see the warning in §1.

Use this when you changed the player, changed the course (a slide, a directive,
a new AU), or need a test-id the bundled player doesn't have yet.

The course is authored in the RapidCMI5 editor. The e2e course repo is
<https://gitlab.global.rangeos.engineering/metova-cmi5-builder/team-2/e2e-tests.git>
and can be imported into the editor (anyone with team-2 access is already set
up). Scenarios follow the naming convention `e2e-<typeoftest>-<testdetails>`
(e.g. `e2e-basic-individual`).

### ⚠️ The zip must bundle a PRODUCTION player build

1. **Production, not dev.** A dev build 404s its `vendor.js` and the player
   iframe renders blank.
2. **It must carry the test-id contract** the specs query (`player-slide-*`,
   `directive-*`, `scenario-*`, `team-scenario-*`, `data-connected`, …). These
   live in `cc-cmi5-player` source — if the bundled player predates a test-id,
   the matching spec can't find it.

### The loop

Four steps. Step 2 is a manual step in the editor UI — there is currently no
script that goes straight from a player build to a course zip, because the zip
has to bundle the player *and* the course content together.

```bash
# 1. Build the production player and stage it into the editor's assets
npm run build:player-for-editor

# 2. In the editor UI: (re-)export the e2e course -> e2e-tests.zip
#    This is what bundles the player you just built WITH the course content.
#    Skipping this means step 3 uploads a zip with the OLD player in it.

# 3. Upsert the zip into Moodle (updates the activity IN PLACE)
npm run upload:moodle -- --zip "C:/path/to/e2e-tests.zip"

# 4. Now run the tests (§1 step 3)
npx nx e2e cc-cmi5-moodle-e2e --configuration=chromium
```

`build:player-for-editor` runs `nx build cc-cmi5-player`, zips the output, and
copies it to `apps/rapid-cmi5-electron-frontend/src/assets/cc-cmi5-player.zip`.
It stages the player for the editor — it does **not** produce a course zip, which
is why step 2 can't be skipped.

### Or let the script drive it

`npm run e2e -- --all` runs exactly the four steps above: builds, pauses for the
editor export, finds the zip, uploads, and runs the suite — see §1 step 3.
`scripts/e2e-run.js` is a thin wrapper over the same npm scripts, so anything it
does you can also do by hand.

Step 3 upserts via the `local_rapidcmi5` plugin's `deploy_package` WS, keyed on
the package's `courseId` IRI (auto-read from the zip's `cmi5.xml`). Because it
updates in place, the **cmid stays stable** — `MOODLE_ACTIVITY_ID` no longer
churns on every upload the way it did under the old delete-and-recreate flow.

Optional flags: `--version <str>` (defaults to a build timestamp),
`--project-id <iri>` (overrides the courseId read from `cmi5.xml`).

Needs `MOODLE_WS_TOKEN` (on the "RapidCMI5 Integration" service, with the
`local/rapidcmi5:deploy` capability) and `MOODLE_COURSE_ID`. See
`C:\code\bylight\moodle-mod_rapidcmi5` and its README.

---

## 6. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `Missing required env var MOODLE_BOT_USER` (or similar) | `.env.local` is missing, or it's in this app folder instead of the **repo root**. |
| Every test fails at login | Bot password rotated, or Moodle is down. Open `MOODLE_BASE_URL` in a browser and log in by hand. |
| Player iframe is blank | The course zip bundles a **dev** player build (404s `vendor.js`). Re-run the §5 refresh flow. |
| **Tests pass but your change isn't there** | You skipped §5. The suite ran against the previously-uploaded player. Build → export → upload, then re-run. |
| A spec can't find a test-id | The bundled player predates that test-id. Rebuild + re-upload the course (§5). |
| Tests pass individually but fail as a suite | Progress state leaking between tests — confirm you see the `[resetRegistration] … clean slate` line at the start of the run. |
| Scenario AU skips to the End Slide | The registration reset didn't run (missing `MOODLE_BOT_USER_ID` / `MOODLE_RESET_WS_TOKEN`, or you're running via the VS Code extension, which skips `globalSetup`). |
| Scenario test hangs at "never Ready" | Usually the range backend, not your change. Retry; check RangeOS is up. |
| Wrong course / weird failures everywhere | `MOODLE_ACTIVITY_ID` points at the wrong activity. Confirm it against `mod/cmi5/view.php?id=<id>`. |
| `npm run e2e` warns "Activity id changed" | The upsert created a NEW activity (new project, or the `courseId` IRI changed). Set `MOODLE_ACTIVITY_ID` to the cmid it printed. |

### Setting up the reset token (one time)

`mod_cmi5_reset_registration_state` can't be added to the built-in "RapidCMI5
Integration" service through the Moodle UI. Create a **custom** external
service, add `mod_cmi5_reset_registration_state` (plus
`core_user_get_users_by_field` if you want the userid auto-lookup), mint a token
on it, and set `MOODLE_RESET_WS_TOKEN`. It falls back to `MOODLE_WS_TOKEN` if
both functions ever live on one service.

---

## 7. Todo / upcoming

| Todo | Notes |
| --- | --- |
| LMS statement tests | none yet |
| Resume lesson tests | none yet |
| More detailed scenario checks (autograder etc.) | none yet |
| Quiz runner scenario test | none yet |
| Tests to check scores in Moodle and the gradebook | none yet |
| Run the suite in CI | currently local / on-demand only |
