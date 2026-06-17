# Moodle Player E2E Strategy

## Why this exists

We have three tiers of end-to-end tests, at increasing fidelity to what a real
learner experiences:

| Tier | Project | Proves | Launch |
|------|---------|--------|--------|
| **Editor / authoring** | `rapid-cmi5-electron-frontend` (Playwright) | You can author a course: repos, courses, lessons, directives, save. | n/a |
| **Player render** (`@render`) | `cc-cmi5-player-e2e` (Playwright) | A course zip *renders* in the player: slides, media, blocks, the quiz directive appears. | **Synthetic** — `?endpoint=test&fetch=test&...` trips `checkForDevMode()` so the player never reaches a real LRS. |
| **Real learner flow** (`@moodle`) | `cc-cmi5-moodle-e2e` (Playwright, this doc) | A course *works* end to end: real cmi5 session, statements to the LRS, completion status, scenarios actually run. | **Real** — Moodle's `launch.php` mints a genuine launch URL. |

### The wall the render tier hit

The player render tests fake the launch on purpose. `SYNTHETIC_LAUNCH_PARAMS`
(`?endpoint=test&fetch=test&actor=test&activityId=test&registration=test`) sets
`isTestMode=true`, which short-circuits LRS hydration so a quiz renders without a
backend. That's great for asserting "the directive drew," but it means the render
tier **structurally cannot** prove a scenario *works* — a scenario is a session
(real `endpoint`/`fetch` credentials, statements posted, AU mappings resolved,
the Range scenario provisioned), none of which exist when every param is the
string `"test"`.

The only way to test the learner flow is to drive it the way learners do: launch
through Moodle.

## What this tier reuses

- **The test-id contract.** Every directive renders `data-testid="directive-<name>"`;
  the player exposes `player-slide-content`, `player-slide-tab-<n>`, etc. These are
  **host-agnostic** — they resolve identically whether the player is served by its
  own dev server or iframed by Moodle's `launch.php`. The assertions don't change;
  only how we *get to* the player changes.
- **The build pipeline.** `buildCmi5` + `zipCmi5` from `apps/cmi5-builder/src/main.ts`.
- **`MoodleUploadService`** (`apps/cmi5-builder/src/services/moodle/moodleUploadService.ts`)
  for upload, including its `applyAuMappings` path for scenarios.

## What's new

1. **Provisioning** — build + zip + upload the latest course to Moodle per run,
   with teardown. Programmatic, hermetic. Kills the hardcoded-`737` problem.
2. **Moodle navigation** — log in as the e2e bot, find the activity, click Launch,
   enter the player iframe/popup.
3. **Real-session assertions** — completion status flips to Passed; scenarios load.

## Auth surface (two distinct paths — do not conflate)

| Purpose | Credential | Env var |
|---------|-----------|---------|
| Upload the course zip (web service) | Moodle WS token | `MOODLE_WS_TOKEN` |
| Browser learner session (login + launch) | e2e bot admin account | `MOODLE_BOT_USER`, `MOODLE_BOT_PASS` |
| AU → scenario mappings (scenarios only) | ROS devops JWT | `JWT_DEVOPS_API` |

Plus the locations:

| Env var | Meaning | Example |
|---------|---------|---------|
| `MOODLE_BASE_URL` | Moodle site | `https://moodle5.develop-cp.rangeos.engineering` |
| `MOODLE_ACTIVITY_ID` | cmi5 activity (`mod/cmi5/view.php?id=`) | `737` (spike) |
| `MOODLE_COURSE_ID` / `MOODLE_SECTION_ID` | upload target | provisioning only |

None of these are committed. CI injects them as secrets; locally use a
`.env` (gitignored).

## Provisioning: upsert vs. delete+recreate (OPEN — decided in the spike)

`MoodleUploadService` today can `getCourse` / `createCourse` / `updateCourse`,
but **`updateCourse` is stubbed** — when a course exists it logs
*"Course update currently not supported"* and no-ops — and there is **no delete**.
Per-run provisioning needs one of:

- **Upsert** — `getCourse` by title; if it exists `updateCourse` (real), else
  `createCourse`. Keeps the activity **id stable**, so the URL (`view.php?id=...`)
  is predictable. Preferred, but needs the real `mod_cmi5launch_update_cmi5_course`
  call working.
- **Delete + recreate** — fresh `createCourse` each run. Simpler per-call, but the
  activity id changes every run, so tests must **discover** the id rather than
  hardcode it.

We defer this choice to the spike, where we'll observe what the plugin's update /
delete web-service functions actually return before committing.

## Cross-origin mechanics

Moodle's `launch.php` opens the player. Two possible shapes (confirmed in the spike):

- **Iframe** — `page.frameLocator('iframe[...]')`, then existing test-ids inside it.
- **Popup / new tab** — `const player = await page.waitForEvent('popup')`, then
  drive `player`.

Either way the `getByTestId('player-slide-content')` locators carry over unchanged.

## Phasing

1. **Spike** — bot logs into Moodle, launches the existing `737`, assert the player
   renders via the real launch link. Observe: iframe vs popup, and the plugin's
   update/delete WS responses. *(This is the load-bearing de-risking step.)*
2. **Pick upsert vs. delete+recreate**, then harden `MoodleUploadService`.
3. **Provisioning fixture** — build/zip/upload latest per run; capture activity id.
4. **Port render assertions** into the Moodle context (reuse locators).
5. **Real-session tests** — completion status, scenario launch. The payoff.
6. Keep this doc current.

## Project layout

```
apps/cc-cmi5-moodle-e2e/
  playwright.config.ts        # baseURL = MOODLE_BASE_URL; NO webServer (Moodle is remote)
  src/
    moodle/
      env.ts                  # reads + validates the env vars above
      moodleSession.ts        # login, gotoActivity, launchAu -> player frame/page
      provisionCourse.ts      # build + zip + upload + teardown  (phase 3)
    fixtures/
      moodle-course-fixture.ts
    e2e/
      launch.spec.ts          # the spike
      completion.spec.ts      # phase 5
      scenario.spec.ts        # phase 5
```

Run: `npx nx e2e cc-cmi5-moodle-e2e`
