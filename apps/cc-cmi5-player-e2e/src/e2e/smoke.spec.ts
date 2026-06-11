import { test, expect } from '@playwright/test';
import {
  SYNTHETIC_LAUNCH_PARAMS,
  goToPlayer,
  uploadFixture,
} from '../e2e-utils';

/**
 * Player smoke + first fixture-driven test.
 *
 * The first test is pure infrastructure: prove the player serves on
 * :4201, the bundle loads, the React root mounts. No fixture upload —
 * whatever was previously in `apps/cc-cmi5-player/src/test/config.json`
 * is what renders. This catches "dev server is dead" before we ever
 * try the more elaborate fixture flow.
 *
 * The second test uploads the committed `e2e-tests-course.zip` fixture
 * (a real published course produced by the editor's "Test in Player"
 * flow) and verifies it loads. This is the first real end-to-end check
 * that the publish → player handoff works against a known-good artifact.
 *
 * **Layer (L3) discipline:** these tests only verify the player
 * *renders*, not that specific slide content is correct. Slide-by-slide
 * content assertions and directive playback behaviour belong in their
 * own specs (slide-navigation, view-media, view-blocks, activities,
 * exit — see [Student backlog](../../../../docs/moodle-player-e2e-strategy.md)).
 */

test.describe('player infrastructure @smoke', () => {
  test('serves on :4201 and mounts the React root', async ({ page }) => {
    await page.goto(`/${SYNTHETIC_LAUNCH_PARAMS}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title).toBeTruthy();

    const root = page.locator('#root');
    await expect(root).toBeAttached();

    const childCount = await root.locator('*').count();
    expect(childCount).toBeGreaterThan(0);
  });
});

test.describe('e2e-tests (foundation fixture) @smoke', () => {
  test('uploads the published course zip and the player loads it', async ({
    page,
    request,
  }) => {
    // The fixture was produced by the editor's "Test in Player" rocket-icon
    // flow against a single-block / single-lesson course with 7 slides
    // (welcome / image / video / audio / table / blocks / goodbye). The
    // lesson lives at compiled_course/blocks/e2e-tests/core/ inside the
    // zip — the dev server's /upload-lesson-zip endpoint expects this path.
    await uploadFixture(
      request,
      'e2e-tests.zip',
      'compiled_course/blocks/e2e-tests/core',
    );

    const root = await goToPlayer(page);

    // Course-load smoke: after upload + navigation, the player should have
    // rendered the slide. We don't assert specific text yet — that's the
    // job of slide-by-slide specs. Here we just want to know that the
    // upload was actually picked up and the player didn't crash on it.
    const renderedText = await root.innerText();
    expect(renderedText.length).toBeGreaterThan(0);
  });
});
