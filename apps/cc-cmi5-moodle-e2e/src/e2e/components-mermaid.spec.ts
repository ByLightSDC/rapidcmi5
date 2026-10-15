import type { FrameLocator, Page } from '@playwright/test';
import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Mermaid diagram tests — the Components:Mermaid lesson (CCUI-3260). One slide
 * (Slide 1 = tab-0) with four ```mermaid blocks, in DOM order:
 *   0. a flowchart with accTitle/accDescr
 *   1. the DNS sequence diagram from the grey space course (module 08)
 *   2. a flowchart inside the SECOND tab of a tabs directive
 *   3. a deliberately invalid diagram
 *
 * Every diagram is a `mermaid-diagram` test-id with `data-mermaid-status`
 * (loading | rendered | error).
 *
 *  DIAGRAMS RENDER LAZILY. MermaidDiagram waits until it is visible (an
 * IntersectionObserver) because mermaid  measures text while laying out, so a
 * diagram below the fold or in a display:none tab stays `loading` until it is
 * scrolled to / shown. Always scroll a diagram into view before asserting it.
 */

const SLIDE = 'player-slide-tab-0';
const MERMAID_RENDER_TIMEOUT = 20_000; // first render also fetches mermaid's lazy chunks

const FLOWCHART = 0;
const SEQUENCE = 1;
const TAB_DIAGRAM = 2;
const INVALID = 3;

function diagram(player: FrameLocator | Page, index: number) {
  return player
    .getByTestId('player-slide-content')
    .getByTestId('mermaid-diagram')
    .nth(index);
}

async function showDiagram(player: FrameLocator | Page, index: number) {
  const el = diagram(player, index);
  await el.scrollIntoViewIfNeeded();
  return el;
}

test.describe('mermaid diagrams @content', () => {
  test.use({ auName: 'Components:Mermaid' });

  test.beforeEach(async ({ player }) => {
    await player.getByTestId(SLIDE).click();
    await expect(player.getByTestId('player-slide-content')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('renders a flowchart as an SVG, not as code', async ({ player }) => {
    const flowchart = await showDiagram(player, FLOWCHART);

    await expect(flowchart).toHaveAttribute('data-mermaid-status', 'rendered', {
      timeout: MERMAID_RENDER_TIMEOUT,
    });
    await expect(flowchart.locator('svg')).toBeVisible();
    await expect(flowchart.getByText('E2E Mermaid Middle')).toBeVisible();

    // The fence source must not leak through as a code block. (Match the node
    // definition syntax — the rendered SVG only contains the bare label, and
    // the invalid diagram's error card also shows "flowchart LR" source.)
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByText('A[E2E Mermaid Start]'),
    ).toHaveCount(0);
  });

  test('exposes accTitle as the SVG accessible title', async ({ player }) => {
    const flowchart = await showDiagram(player, FLOWCHART);

    await expect(flowchart).toHaveAttribute('data-mermaid-status', 'rendered', {
      timeout: MERMAID_RENDER_TIMEOUT,
    });
    await expect(flowchart.locator('svg > title')).toHaveText(
      'E2E mermaid flowchart',
    );
  });

  test('renders the grey space DNS sequence diagram', async ({ player }) => {
    const sequence = await showDiagram(player, SEQUENCE);

    await expect(sequence).toHaveAttribute('data-mermaid-status', 'rendered', {
      timeout: MERMAID_RENDER_TIMEOUT,
    });
    await expect(
      sequence.getByText('Recursive Resolver').first(),
    ).toBeVisible();
    await expect(
      sequence.getByText('A = 203.0.113.10 (TTL 300)'),
    ).toBeVisible();
  });

  test('renders a diagram in an inactive tab only once the tab is shown', async ({
    player,
  }) => {
    const tabs = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-tabs');
    await tabs.scrollIntoViewIfNeeded();

    // Hidden tab panel (display:none) → never intersects → not rendered yet.
    const tabDiagram = diagram(player, TAB_DIAGRAM);
    await expect(tabDiagram).toHaveAttribute('data-mermaid-status', 'loading');

    await tabs.getByRole('tab', { name: 'Diagram Tab' }).click();

    await expect(tabDiagram).toHaveAttribute(
      'data-mermaid-status',
      'rendered',
      { timeout: MERMAID_RENDER_TIMEOUT },
    );
    const label = tabDiagram.getByText('E2E Tab Diagram Top');
    await expect(label).toBeVisible();

    // Rendered while visible → text was measured, so the label has real size.
    // (Rendered while hidden, mermaid lays labels out at ~0 width.)
    const box = await label.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(20);
  });

  test('shows an error card, not a crash, for invalid mermaid', async ({
    player,
    playerErrors,
  }) => {
    const invalid = await showDiagram(player, INVALID);

    await expect(invalid).toHaveAttribute('data-mermaid-status', 'error', {
      timeout: MERMAID_RENDER_TIMEOUT,
    });
    await expect(invalid.getByText('Unable to render diagram')).toBeVisible();
    await expect(invalid.locator('svg')).toHaveCount(0);

    // A parse failure is handled in-component; it must not surface as a
    // console error / uncaught exception.
    playerErrors.assertClean();
  });
});
