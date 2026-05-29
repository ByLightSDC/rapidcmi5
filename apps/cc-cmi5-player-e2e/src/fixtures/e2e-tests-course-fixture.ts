import { test as base } from '@playwright/test';
import { uploadFixture, goToPlayer } from '../e2e-utils';

/**
 * Playwright fixture that uploads the `e2e-tests.zip` course and lands
 * the test on a freshly-loaded player. Use this as the `test` import
 * for any spec that exercises the Welcome / Image / Video / Audio /
 * Table / Blocks / Goodbye course flow.
 *
 *   import { test, expect } from '../fixtures/e2e-tests-course-fixture';
 *
 *   test('something', async ({ page }) => {
 *     // page is already on the player with slide 0 active
 *     await page.getByTestId('player-slide-tab-1').click();
 *     // ...
 *   });
 *
 * The fixture uploads on every test, so each test starts from a known
 * state (slide 0 active, no resume state from prior tests). The player
 * dev server's /upload-lesson-zip endpoint is the single source of
 * mutable state, and since the player suite runs with `workers: 1`
 * (see playwright.config.ts), upload races are not a concern.
 *
 * **Slide order** (mirrors the fixture's lesson config.json):
 *   0 Welcome — title screen
 *   1 Image   — single img element
 *   2 Video   — single video element
 *   3 Audio   — single audio element
 *   4 Table   — single table element
 *   5 Blocks  — Tabs (3 tabs) + Accordion (3 sections)
 *   6 Goodbye — minimal end slide
 */

const FIXTURE_NAME = 'e2e-tests.zip';
const LESSON_DIR_PATH = 'compiled_course/blocks/e2e-tests/core';

export const test = base.extend({
  page: async ({ page, request }, use) => {
    await uploadFixture(request, FIXTURE_NAME, LESSON_DIR_PATH);
    await goToPlayer(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
