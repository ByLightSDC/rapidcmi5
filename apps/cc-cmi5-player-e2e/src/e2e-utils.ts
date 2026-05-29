import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Test-id contract for the player suite (type-level, not instance-level).
 *
 * Every directive renders with `data-testid="directive-<name>"` on its
 * root element. No author labeling is needed; tests find directives by
 * type and use `.nth(n)` when a slide contains multiple of the same kind.
 *
 *   directive-tabs          directive-accordion       directive-steps
 *   directive-grid          directive-grid-cell       directive-quotes
 *   directive-statements    directive-layout-box      directive-activity
 *   directive-image-label   directive-image-text
 *
 * Embedded media (image/video/audio/table) uses HTML5 element roles
 * instead of data-testid:
 *
 *   page.getByRole('img')           page.locator('video')
 *   page.locator('audio')           page.locator('table')
 *
 * Player layout / navigation:
 *
 *   player-slide-content       — the scrollable Box that holds the
 *                                current slide's rendered content
 *                                (excludes sidebar, toolbar, exit slide)
 *   player-slide-nav           — the sidebar Tabs container
 *   player-slide-tab-<index>   — individual slide entry (0-based)
 *   player-exit-tab            — the Exit entry in the slide list
 *   player-exit-pinned         — the pinned Exit at the bottom (when scrolled)
 *   player-exit-slide          — the synthetic exit-slide content
 *                                (rendered when Exit tab is active)
 *
 * Math / Footnote / Animation / FX directives do not have test-ids yet;
 * they'll be added when a test needs them.
 */

/**
 * Standard CMI5 launch query params that Moodle would supply when
 * launching a course. Stubbed to `test` so the player accepts them
 * without trying to reach a real LRS. Used by `goToPlayer`.
 */
export const SYNTHETIC_LAUNCH_PARAMS =
  '?endpoint=test&fetch=test&actor=test&activityId=test&registration=test';

/**
 * Absolute path to a fixture course zip, by short name.
 * Fixtures live in `apps/cc-cmi5-player-e2e/src/fixtures/courses/`.
 */
function fixturePath(zipName: string): string {
  // __dirname at runtime resolves to the compiled output, so we anchor
  // relative to the source tree explicitly. Playwright runs from
  // workspace root, so use a stable relative path.
  return resolve(
    process.cwd(),
    'apps/cc-cmi5-player-e2e/src/fixtures/courses',
    zipName,
  );
}

/**
 * POSTs a committed fixture zip to the player dev server's
 * `/upload-lesson-zip` endpoint, which extracts the lesson's
 * `config.json` and `Assets/` into `apps/cc-cmi5-player/src/test/`.
 *
 * **Side effect:** mutates `apps/cc-cmi5-player/src/test/config.json`
 * on disk. Player tests run with `workers: 1` (set in playwright.config.ts)
 * to avoid races on this shared file. Don't expect parallel safety.
 *
 * @param request Playwright's APIRequestContext (from the `request` fixture
 *   or `page.request`). Sends the zip as application/octet-stream.
 * @param zipName Filename inside `apps/cc-cmi5-player-e2e/src/fixtures/courses/`.
 *   Just the basename, e.g. `'e2e-tests-course.zip'`.
 * @param lessonDirPath Path inside the zip pointing at the lesson directory
 *   (the folder containing `config.json` + `Assets/`). For courses produced
 *   by the editor this is `compiled_course/blocks/<block>/<lesson>`.
 *   Required by the dev server's middleware.
 */
export async function uploadFixture(
  request: APIRequestContext,
  zipName: string,
  lessonDirPath: string,
): Promise<void> {
  const zipBytes = readFileSync(fixturePath(zipName));
  const response = await request.post('/upload-lesson-zip', {
    params: { lessonDirPath },
    headers: { 'Content-Type': 'application/octet-stream' },
    data: zipBytes,
  });

  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `uploadFixture(${zipName}) failed: ${response.status()} ${response.statusText()} — ${body}`,
    );
  }

  const json = await response.json().catch(() => ({ success: false }));
  if (!json.success) {
    throw new Error(
      `uploadFixture(${zipName}) returned success:false — ${JSON.stringify(json)}`,
    );
  }
}

/**
 * Navigates to the player with synthetic CMI5 launch params, waits for
 * the React root to mount, and returns the root locator.
 *
 * Always call this *after* `uploadFixture` so the player loads the
 * just-uploaded course config on this fresh navigation.
 */
export async function goToPlayer(page: Page): Promise<Locator> {
  await page.goto(`/${SYNTHETIC_LAUNCH_PARAMS}`);
  await page.waitForLoadState('domcontentloaded');

  // The player mounts into <div id="root"> (see apps/cc-cmi5-player/src/index.html).
  // Wait for it to have *some* child before returning so tests can rely on
  // the player having actually rendered, not just the empty shell.
  const root = page.locator('#root');
  await expect(root).toBeAttached();
  await expect(root.locator('*').first()).toBeVisible({ timeout: 15_000 });
  return root;
}
