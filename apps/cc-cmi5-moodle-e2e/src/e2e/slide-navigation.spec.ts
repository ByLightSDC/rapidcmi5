import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Slide navigation tests — ported from cc-cmi5-player-e2e to run against a
 * real Moodle launch. The `player` fixture is the launch.php iframe scope;
 * assertions are otherwise identical to the synthetic suite because the
 * player markup is the same.
 *
 * Slide order (mirrors the current e2e-tests course — 9 slides; the
 * "Individual Scenario" slide was added at index 7, pushing Goodbye to 8):
 *   0 Welcome / 1 Image / 2 Video / 3 Audio / 4 Table / 5 Blocks /
 *   6 Quiz / 7 Individual Scenario / 8 Goodbye
 *
 * **NOTE on resume state:** unlike the synthetic suite (fresh upload per
 * test), real Moodle remembers where the learner left off, so the active
 * slide on load is NOT guaranteed to be Welcome. Tests that depend on a
 * specific starting slide explicitly click to it first.
 *
 * **L3 scope:** asserts the click → active-tab transition, not slide content.
 */

test.describe('slide navigation @navigation', () => {
  test('sidebar renders all 9 slide tabs plus Exit', async ({ player }) => {
    const slideTabs = player.getByTestId(/^player-slide-tab-\d+$/);
    await expect(slideTabs).toHaveCount(9);
    await expect(player.getByTestId('player-exit-tab')).toBeVisible();
  });

  test('clicking a slide tab activates it and deactivates the previous one', async ({
    player,
  }) => {
    const tab0 = player.getByTestId('player-slide-tab-0');
    const tab3 = player.getByTestId('player-slide-tab-3');

    // Start from a known slide rather than relying on resume state.
    await tab0.click();
    await expect(tab0).toHaveAttribute('aria-selected', 'true');
    await expect(tab3).toHaveAttribute('aria-selected', 'false');

    await tab3.click();

    await expect(tab3).toHaveAttribute('aria-selected', 'true');
    await expect(tab0).toHaveAttribute('aria-selected', 'false');
  });

  test('every slide tab can be activated by clicking', async ({ player }) => {
    for (let i = 0; i < 9; i++) {
      const tab = player.getByTestId(`player-slide-tab-${i}`);
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('slide titles match the expected order (Welcome → Goodbye)', async ({
    player,
  }) => {
    const expectedTitles = [
      'Welcome',
      'Image',
      'Video',
      'Audio',
      'Table',
      'Blocks',
      'Quiz',
      'Individual Scenario',
      'Goodbye',
    ];
    for (let i = 0; i < expectedTitles.length; i++) {
      const tab = player.getByTestId(`player-slide-tab-${i}`);
      await expect(tab).toContainText(expectedTitles[i]);
    }
  });
});
