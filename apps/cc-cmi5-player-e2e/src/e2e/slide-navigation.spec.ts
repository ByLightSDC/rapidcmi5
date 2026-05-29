import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * Slide navigation tests against the player.
 *
 * The fixture uploads the `e2e-tests.zip` course (7 slides + Exit) and
 * lands each test on the freshly-loaded player. These tests exercise
 * the **sidebar tab navigation** — the only nav surface the player
 * exposes (no separate prev/next buttons in the toolbar).
 *
 * Slide order:
 *   0 Welcome / 1 Image / 2 Video / 3 Audio / 4 Table / 5 Blocks / 6 Goodbye
 *
 * **L3 scope:** these assert the click → active-tab transition. They do
 * not verify what content lands inside the slide (that's view-media,
 * view-blocks, etc.).
 */

test.describe('slide navigation', () => {
  test('sidebar renders all 7 slide tabs plus Exit', async ({ page }) => {
    const slideTabs = page.getByTestId(/^player-slide-tab-\d+$/);
    await expect(slideTabs).toHaveCount(7);
    await expect(page.getByTestId('player-exit-tab')).toBeVisible();
  });

  test('first slide tab is selected on initial load', async ({ page }) => {
    // The first tab (`player-slide-tab-0`, "Welcome") should be the
    // active one right after the fixture loads.
    const firstTab = page.getByTestId('player-slide-tab-0');
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');

    // No other tab should be selected.
    const otherTabs = page.getByTestId(/^player-slide-tab-[1-6]$/);
    for (let i = 0; i < (await otherTabs.count()); i++) {
      await expect(otherTabs.nth(i)).toHaveAttribute(
        'aria-selected',
        'false',
      );
    }
  });

  test('clicking a slide tab activates that tab and deactivates the previous one', async ({
    page,
  }) => {
    const tab0 = page.getByTestId('player-slide-tab-0');
    const tab3 = page.getByTestId('player-slide-tab-3');

    await expect(tab0).toHaveAttribute('aria-selected', 'true');
    await expect(tab3).toHaveAttribute('aria-selected', 'false');

    await tab3.click();

    await expect(tab3).toHaveAttribute('aria-selected', 'true');
    await expect(tab0).toHaveAttribute('aria-selected', 'false');
  });

  test('every slide tab can be activated by clicking', async ({ page }) => {
    // Walk forward through every slide. This catches a tab being
    // disabled/missing or activation failing for a specific index.
    for (let i = 0; i < 7; i++) {
      const tab = page.getByTestId(`player-slide-tab-${i}`);
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('slide titles match the expected order (Welcome → Goodbye)', async ({
    page,
  }) => {
    // Sanity-check the fixture's slide order. If someone re-exports the
    // course and the order shifts, this test fails fast with a clear
    // diff rather than letting downstream tests fail mysteriously
    // because they targeted the wrong index.
    const expectedTitles = [
      'Welcome',
      'Image',
      'Video',
      'Audio',
      'Table',
      'Blocks',
      'Goodbye',
    ];
    for (let i = 0; i < expectedTitles.length; i++) {
      const tab = page.getByTestId(`player-slide-tab-${i}`);
      await expect(tab).toContainText(expectedTitles[i]);
    }
  });
});
