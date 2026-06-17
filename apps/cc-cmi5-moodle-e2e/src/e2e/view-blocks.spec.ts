import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * View Blocks tests — ported from cc-cmi5-player-e2e to run against a real
 * Moodle launch. The Blocks slide (#5) contains tabs / accordion /
 * statements / grid directives plus a quote admonition. Assertions check
 * the directive containers render via their `directive-<name>` test-ids and
 * that distinctive fixture text appears.
 *
 * **L3 scope:** container render + text presence. Sub-content interactivity
 * (tab clicks, accordion expand) is not covered here.
 */

test.describe('view blocks @content', () => {
  test('Blocks slide renders a tabs directive', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const tabs = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-tabs');
    await expect(tabs).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide renders an accordion directive', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const accordion = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-accordion');
    await expect(accordion).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows the fixture tab labels', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Tab 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Tab 3 Title')).toBeVisible();
  });

  test('Blocks slide shows the fixture accordion section labels', async ({
    player,
  }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Accordion 1 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 2 Title')).toBeVisible();
    await expect(slideContent.getByText('Accordion 3 Title')).toBeVisible();
  });

  test('Blocks slide renders a statements directive', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const statements = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-statements');
    await expect(statements).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows the fixture statement text', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(
      slideContent.getByText('Statement: e2e fixture statement content'),
    ).toBeVisible();
  });

  test('Blocks slide renders a grid (layout grid) directive', async ({
    player,
  }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const grid = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-grid');
    await expect(grid).toBeVisible({ timeout: 10_000 });
  });

  test('Blocks slide shows both grid cell labels', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('Cell 1: Cell A')).toBeVisible();
    await expect(slideContent.getByText('Cell 2: Cell B')).toBeVisible();
  });

  test('Blocks slide shows the Quote admonition text', async ({ player }) => {
    await player.getByTestId('player-slide-tab-5').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(
      slideContent.getByText('Quote: e2e fixture quote content'),
    ).toBeVisible();
  });
});
