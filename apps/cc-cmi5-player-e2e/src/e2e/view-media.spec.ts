import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * View Media tests against the player.
 *
 * Each test navigates to a media slide (Image / Video / Audio / Table)
 * via the sidebar and asserts the expected HTML5 element renders inside
 * the player's slide-content area.
 *
 * **Selector approach:** embedded media in markdown renders as standard
 * HTML5 elements (`<img>`, `<video>`, `<audio>`, `<table>`). We use
 * element/role locators rather than `data-testid` because these aren't
 * our custom directives — the testid contract is for things we control,
 * not things the markdown library renders.
 *
 * Locators are scoped to `player-slide-content` to exclude the course
 * logo `<img>` in the sidebar nav.
 *
 * **L3 scope:** asserts only that the media element is present and
 * visible. Doesn't verify the media actually plays (would require audio
 * decoding / video frame inspection — L2 territory or beyond).
 */

test.describe('view media @content', () => {
  test('Image slide renders an <img>', async ({ page }) => {
    await page.getByTestId('player-slide-tab-1').click();

    const slideImage = page
      .getByTestId('player-slide-content')
      .locator('img')
      .first();
    await expect(slideImage).toBeVisible({ timeout: 10_000 });
  });

  test('Video slide renders a <video>', async ({ page }) => {
    await page.getByTestId('player-slide-tab-2').click();

    const video = page
      .getByTestId('player-slide-content')
      .locator('video')
      .first();
    // <video> elements aren't always reported as `visible` (zero-size on
    // load until media metadata arrives) — toBeAttached is the right
    // assertion: the element exists in the DOM.
    await expect(video).toBeAttached({ timeout: 10_000 });
  });

  test('Audio slide renders an <audio>', async ({ page }) => {
    await page.getByTestId('player-slide-tab-3').click();

    const audio = page
      .getByTestId('player-slide-content')
      .locator('audio')
      .first();
    await expect(audio).toBeAttached({ timeout: 10_000 });
  });

  test('Table slide renders a <table>', async ({ page }) => {
    await page.getByTestId('player-slide-tab-4').click();

    const table = page
      .getByTestId('player-slide-content')
      .locator('table')
      .first();
    await expect(table).toBeVisible({ timeout: 10_000 });
  });
});
