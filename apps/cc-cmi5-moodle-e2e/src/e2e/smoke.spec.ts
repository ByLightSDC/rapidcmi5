import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Moodle launch smoke — the real-flow analogue of the synthetic suite's
 * `smoke.spec.ts`.
 *
 * The synthetic version had two layers: a raw "dev server serves on :4201"
 * infra check, then a fixture upload + load. Here both collapse into one
 * thing the `player` fixture already guarantees: a real Moodle launch
 * produced a live player. These tests confirm that handoff didn't crash
 * and the course actually rendered.
 *
 * **L3 scope:** verifies the player *rendered*, not specific slide content.
 * Slide-by-slide assertions live in slide-navigation / view-media /
 * view-blocks / activities / exit.
 */

test.describe('moodle launch smoke @smoke', () => {
  test('the launched player renders its slide content', async ({ player }) => {
    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent).toBeVisible({ timeout: 30_000 });

    const renderedText = await slideContent.innerText();
    expect(renderedText.length).toBeGreaterThan(0);
  });

  test('the launched player renders the slide navigation', async ({
    player,
  }) => {
    // At least the first slide tab should exist — proof the course's
    // slide list loaded, not just an empty player shell.
    await expect(player.getByTestId('player-slide-tab-0')).toBeVisible({
      timeout: 30_000,
    });
  });
});
