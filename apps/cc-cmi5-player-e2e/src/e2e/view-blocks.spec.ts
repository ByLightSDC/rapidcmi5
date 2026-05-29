import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * View Blocks tests against the player.
 *
 * The Blocks slide (#5 in the fixture) contains:
 *   - a Tabs directive with 3 tabs (Tab 1, Tab 2, Tab 3)
 *   - an Accordion directive with 3 sections (Accordion 1, 2, 3)
 *
 * These tests assert the directive containers render via their
 * `directive-tabs` / `directive-accordion` test-ids. Sub-content (tab
 * panels, accordion sections expanding on click) is L2 territory and
 * not covered here.
 *
 * **Why this works without manual labeling:** the directive renderers
 * in `packages/ui/src/lib/cmi5/mdx/plugins/<name>/*Editor.tsx` carry
 * `data-testid="directive-<name>"` automatically — see the auto-testid
 * convention documented at the top of `src/e2e-utils.ts`.
 */

test.describe('view blocks', () => {
  test('Blocks slide renders a tabs directive', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const tabs = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-tabs');
    await expect(tabs).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide renders an accordion directive', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const accordion = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-accordion');
    await expect(accordion).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows the fixture tab labels', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    // The fixture's three tabs are titled "Tab 1 Title" / "Tab 2 Title"
    // / "Tab 3 Title" — these are author-set in the editor and stable
    // until someone re-edits the fixture course.
    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Tab 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 3 Title')).toBeVisible();
  });

  test('Blocks slide shows the fixture accordion section labels', async ({
    page,
  }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Accordion 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 3 Title')).toBeVisible();
  });
});
