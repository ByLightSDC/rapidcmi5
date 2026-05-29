import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * Exit-flow tests against the player.
 *
 * The player injects a synthetic Exit tab after the last real slide.
 * Clicking it swaps the slide content for ExitSlide, which prompts
 * the learner with "Ready to Leave?" and an "Exit Course" button. This
 * is also where the CMI5 `terminated` xAPI verb would normally be sent.
 *
 * **L3 scope:** asserts the click → exit-slide transition. Doesn't
 * verify that `terminated` is actually emitted to a real LRS (that
 * needs an LRS mock — deferred).
 */

test.describe('exit', () => {
  test('clicking the Exit tab activates the exit slide', async ({ page }) => {
    // While we're on a real slide, the exit-slide content should not exist.
    await expect(page.getByTestId('player-exit-slide')).toHaveCount(0);

    await page.getByTestId('player-exit-tab').click();

    const exitSlide = page.getByTestId('player-exit-slide');
    await expect(exitSlide).toBeVisible({ timeout: 10_000 });

    // The exit slide includes a "Ready to Leave?" heading and an
    // "Exit Course" button.
    await expect(exitSlide.getByText('Ready to Leave?')).toBeVisible();
    await expect(
      exitSlide.getByRole('button', { name: /Exit Course/ }),
    ).toBeVisible();
  });

  test('Exit tab is reachable from any slide', async ({ page }) => {
    // Walk from the last real slide (Goodbye = index 6) → Exit. Earlier
    // tests covered exit-from-slide-0; this one verifies it works from
    // a non-initial position (catches state-leakage bugs where the
    // Exit tab is somehow disabled after navigation).
    await page.getByTestId('player-slide-tab-6').click();
    await expect(page.getByTestId('player-slide-tab-6')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.getByTestId('player-exit-tab').click();
    await expect(page.getByTestId('player-exit-slide')).toBeVisible();
  });
});
