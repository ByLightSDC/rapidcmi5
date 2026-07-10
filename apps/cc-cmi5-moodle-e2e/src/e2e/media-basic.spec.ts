import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * View Media tests — the Media:Basic lesson (Image / Video / Audio, one slide
 * each: tab 0 / 1 / 2). Asserts the HTML5 media element renders inside the
 * player's slide-content area.
 *
 * (Table moved to the Components:Basic lesson in the course reorg — see
 * view-blocks.spec.ts.)
 *
 * Locators are scoped to `player-slide-content` to exclude the course logo
 * `<img>` in the sidebar nav. Embedded media renders as standard HTML5
 * elements, so we use element locators rather than test-ids.
 *
 * **L3 scope:** asserts the media element is present/visible, not that it plays.
 */

test.describe('test basic media @content', () => {
  test.use({ auName: 'Media:Basic' });

  test('Image slide renders an <img>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-0').click();

    const slideImage = player
      .getByTestId('player-slide-content')
      .locator('img')
      .first();
    await expect(slideImage).toBeVisible({ timeout: 10_000 });
  });

  test('Video slide renders a <video>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-1').click();

    const video = player
      .getByTestId('player-slide-content')
      .locator('video')
      .first();
    // <video> can report zero-size until metadata loads — toBeAttached is the
    // honest assertion: the element exists in the DOM.
    await expect(video).toBeAttached({ timeout: 10_000 });
  });

  test('Audio slide renders an <audio>', async ({ player }) => {
    await player.getByTestId('player-slide-tab-2').click();

    const audio = player
      .getByTestId('player-slide-content')
      .locator('audio')
      .first();
    await expect(audio).toBeAttached({ timeout: 10_000 });
  });
});
