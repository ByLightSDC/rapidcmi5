import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * View Media tests — ported from cc-cmi5-player-e2e to run against a real
 * Moodle launch. Each test navigates to a media slide (Image / Video /
 * Audio / Table) and asserts the HTML5 element renders inside the player's
 * slide-content area.
 *
 * Locators are scoped to `player-slide-content` to exclude the course logo
 * `<img>` in the sidebar nav. Embedded media renders as standard HTML5
 * elements, so we use element locators rather than test-ids.
 *
 * **L3 scope:** asserts the media element is present/visible, not that it
 * actually plays.
 */

test.describe('view media @content', () => {
  test('Image slide renders an <img>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-1').click();

    const slideImage = player
      .getByTestId('player-slide-content')
      .locator('img')
      .first();
    await expect(slideImage).toBeVisible({ timeout: 10_000 });
  });

  test('Video slide renders a <video>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-2').click();

    const video = player
      .getByTestId('player-slide-content')
      .locator('video')
      .first();
    // <video> can report zero-size until metadata loads — toBeAttached is
    // the honest assertion: the element exists in the DOM.
    await expect(video).toBeAttached({ timeout: 10_000 });
  });

  test('Audio slide renders an <audio>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-3').click();

    const audio = player
      .getByTestId('player-slide-content')
      .locator('audio')
      .first();
    await expect(audio).toBeAttached({ timeout: 10_000 });
  });

  test('Table slide renders a <table>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-4').click();

    const table = player
      .getByTestId('player-slide-content')
      .locator('table')
      .first();
    await expect(table).toBeVisible({ timeout: 10_000 });
  });
});
