import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * View Components tests — the Components:Basic lesson. All directives live on
 * a single slide (Slide 1 = tab-0): a tabs directive, an accordion, a grid,
 * a statements block, a quote admonition, and a table (the table moved here
 * from Media in the course reorg).
 *
 * Asserts the directive containers render via their `directive-<name>`
 * test-ids and that distinctive fixture text appears.
 *
 * **L3 scope:** container render + text presence. Sub-content interactivity
 * (tab clicks, accordion expand) is not covered here.
 */

test.describe('test basic components @content', () => {
  test.use({ auName: 'Components:Basic' });

  // All directives render on the single slide; select it once per test.
  const SLIDE = 'player-slide-tab-0';

  test('renders a tabs directive', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(
      player.getByTestId('player-slide-content').getByTestId('directive-tabs'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('renders an accordion directive', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByTestId('directive-accordion'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows the fixture tab labels', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Tab 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 3 Title')).toBeVisible();
  });

  test('shows the fixture accordion section labels', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Accordion 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 3 Title')).toBeVisible();
  });

  test('renders a statements directive', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByTestId('directive-statements'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows the fixture statement text', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByText('Statement: e2e fixture statement content'),
    ).toBeVisible();
  });

  test('renders a grid (layout grid) directive', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(
      player.getByTestId('player-slide-content').getByTestId('directive-grid'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows both grid cell labels', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Cell 1: Cell A')).toBeVisible();
    await expect(slideContent.getByText('Cell 2: Cell B')).toBeVisible();
  });

  test('renders the Quote admonition with its content', async ({ player }) => {
    await player.getByTestId(SLIDE).click();

    // The fixture quote is a `:::quote` admonition with collapse — its body is
    // hidden by default, so the text is in the DOM but not visible. Assert it
    // rendered (attached) rather than visible. (To assert visibility we'd need
    // to expand the admonition first by clicking its title toggle.)
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByText('Quote: e2e fixture quote content'),
    ).toBeAttached({ timeout: 10_000 });
  });

  test('renders a <table>', async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    const table = player
      .getByTestId('player-slide-content')
      .locator('table')
      .first();
    await expect(table).toBeVisible({ timeout: 10_000 });
  });
});
