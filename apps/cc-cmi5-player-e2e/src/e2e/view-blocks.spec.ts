import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * View Blocks tests against the player.
 *
 * The Blocks slide (#5 in the fixture) contains:
 *   - a Tabs directive with 3 tabs (Tab 1, Tab 2, Tab 3)
 *   - an Accordion directive with 3 sections (Accordion 1, 2, 3)
 *   - a Quote admonition (single, not the Quotes plural block directive)
 *     with text "Quote: e2e fixture quote content"
 *   - a Statements directive with one statement, text
 *     "Statement: e2e fixture statement content"
 *   - a Grid directive (gridContainer) with two cells
 *     "Cell 1: Cell A" / "Cell 2: Cell B"
 *
 * These tests assert the directive containers render via their
 * `directive-<name>` test-ids and that distinctive fixture text appears.
 * Sub-content interactivity (tab clicks, accordion expand, etc.) is L2
 * territory and not covered here.
 *
 * **Why this works without manual labeling:** the directive renderers
 * in `packages/ui/src/lib/cmi5/mdx/plugins/<name>/*Editor.tsx` carry
 * `data-testid="directive-<name>"` automatically — see the auto-testid
 * convention documented at the top of `src/e2e-utils.ts`.
 *
 * **About Quote vs Quotes**: the fixture has a `:::quote` admonition
 * (singular, MDXEditor built-in admonition block), not the `:::quotes`
 * plural block directive we instrumented. Admonitions don't carry a
 * `directive-*` test-id; we assert on the rendered text instead.
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

  test('Blocks slide renders a statements directive', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const statements = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-statements');
    await expect(statements).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows the fixture statement text', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(
      slideContent.getByText('Statement: e2e fixture statement content'),
    ).toBeVisible();
  });

  test('Blocks slide renders a grid (layout grid) directive', async ({
    page,
  }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const grid = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-grid');
    await expect(grid).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows both grid cell labels', async ({ page }) => {
    await page.getByTestId('player-slide-tab-5').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Cell 1: Cell A')).toBeVisible();
    await expect(slideContent.getByText('Cell 2: Cell B')).toBeVisible();
  });

  test('Blocks slide shows the Quote admonition text', async ({ page }) => {
    // The fixture has a `:::quote` admonition (singular, MDXEditor's
    // built-in admonition block) with `collapse="closed"`. If admonitions
    // truly hide their body when collapsed, this assertion may need to
    // switch to `.toBeAttached()` and we'd need a separate test that
    // expands the admonition first. As written it relies on the text
    // being present in the DOM and visible.
    await page.getByTestId('player-slide-tab-5').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(
      slideContent.getByText('Quote: e2e fixture quote content'),
    ).toBeVisible();
  });
});
