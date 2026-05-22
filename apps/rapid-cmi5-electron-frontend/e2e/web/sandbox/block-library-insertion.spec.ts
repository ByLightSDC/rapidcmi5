import { test, expect } from '../../fixtures/sandbox-fixtures';
import { assertBlockLibraryInsertionAddsOne } from '../../e2e-utils';

/**
 * Directive insertion tests against the sandbox substrate — **Block Library
 * drawer path**.
 *
 * Pattern: open the Block Library drawer → click the `block-library-<name>`
 * item → assert the directive's count grew by one. Sibling spec
 * `directive-insertion.spec.ts` exercises the same directives via the main
 * toolbar (a parallel code path through each `Insert*` component's
 * `!isDrawer` branch).
 *
 * **Why both code paths get coverage:** every `Insert<Name>` component
 * renders a different UI tree depending on `isDrawer` — `ButtonMinorUi`
 * (drawer) vs `MUIButtonWithTooltip` (toolbar). They share the underlying
 * `insertAtSelection()` callback, but the wrapping JSX and props are
 * independent. If they diverge, only multi-path coverage catches it.
 *
 * **Layer (L3) discipline:** same as the toolbar spec — these tests only
 * assert that the directive appears in the DOM after insertion. Attribute
 * editing, nested content, save/reload all defer to L2.
 *
 * **Note: Layout Box is *not* covered here** because it isn't surfaced in
 * the Block Library drawer (only the main toolbar). Toolbar coverage in
 * `directive-insertion.spec.ts` is its only L3 home.
 */
test.describe('block library insertion', () => {
  test('Accordion: clicking Block Library → Accordion adds an accordion to the slide', async ({
    page,
  }) => {
    const accordion = page.getByTestId('directive-accordion');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-accordion',
      accordion,
    );
  });

  test('Tabs: clicking Block Library → Tabs adds a tabs container to the slide', async ({
    page,
  }) => {
    const tabs = page.getByTestId('directive-tabs');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-tabs',
      tabs,
    );
  });

  test('Steps: clicking Block Library → Steps adds a steps container to the slide', async ({
    page,
  }) => {
    const steps = page.getByTestId('directive-steps');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-steps',
      steps,
    );
  });

  test('Grid: clicking Block Library → Layout Grid adds a grid container to the slide', async ({
    page,
  }) => {
    const grid = page.getByTestId('directive-grid');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-grid',
      grid,
    );
  });

  test('Table: clicking Block Library → Table adds a 3x3 table to the slide', async ({
    page,
  }) => {
    const editor = page.getByTestId('rc5-visual-editor');
    const table = editor.locator('table');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-table',
      table,
    );
  });

  test('Thematic Break: clicking Block Library → Thematic Break adds an <hr> to the slide', async ({
    page,
  }) => {
    const editor = page.getByTestId('rc5-visual-editor');
    const hr = editor.locator('hr');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-thematic-break',
      hr,
    );
  });

  test('Code Block: expanding Media and clicking Code Block adds a CodeMirror block to the slide', async ({
    page,
  }) => {
    // Code Block lives in the "Media" ViewExpander section of the drawer,
    // which is collapsed by default. The helper expands it before clicking.
    const editor = page.getByTestId('rc5-visual-editor');
    const codeBlock = editor.locator('.cm-editor');
    await assertBlockLibraryInsertionAddsOne(
      page,
      'block-library-code-block',
      codeBlock,
      { expandSection: 'Media' },
    );
  });

  // Quotes and Statements are intentionally omitted: they open a preset
  // picker dialog before inserting, so they don't fit the same shape as
  // the other Block Library items. They'll be covered in Round 3 alongside
  // other dialog-first directives.
});
