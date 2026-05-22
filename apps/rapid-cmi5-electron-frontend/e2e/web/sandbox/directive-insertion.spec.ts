import { test, expect } from '../../fixtures/sandbox-fixtures';
import { assertInsertionAddsOne } from '../../e2e-utils';

/**
 * Directive insertion tests against the sandbox substrate — **toolbar path**.
 *
 * Pattern: focus the editor → click the `insert-<directive>` toolbar button
 * → assert the directive's count grew by one. Sibling spec
 * `block-library-insertion.spec.ts` exercises the same directives via the
 * Block Library drawer (a parallel code path through each `Insert*`
 * component's `isDrawer` branch).
 *
 * **Layer (L3) discipline:** these tests assert *only* that the directive
 * appears in the DOM after insertion. They deliberately do NOT cover:
 *   - Attribute editing on the inserted directive (L2 territory)
 *   - Nested-content editing inside the directive (L2 territory)
 *   - Save / reload / round-trip persistence (L2 territory; see Test #4
 *     fixme in slide-management.spec.ts for why)
 *
 * Each test is self-contained: the sandbox fixture wipes browser storage
 * and remounts a fresh Visual Designer for every `beforeEach`, so tests
 * don't leak state into each other.
 *
 * See `assertInsertionAddsOne` in `e2e-utils.ts` for the relative-count
 * rationale.
 */

test.describe('directive insertion', () => {
  test('Accordion: clicking Insert Accordion adds an accordion to the slide', async ({
    page,
  }) => {
    const accordion = page.getByTestId('directive-accordion');
    await assertInsertionAddsOne(page, 'insert-accordion', accordion);
  });

  test('Tabs: clicking Insert Tabs adds a tabs container to the slide', async ({
    page,
  }) => {
    const tabs = page.getByTestId('directive-tabs');
    await assertInsertionAddsOne(page, 'insert-tabs', tabs);
  });

  test('Steps: clicking Insert Steps adds a steps container to the slide', async ({
    page,
  }) => {
    const steps = page.getByTestId('directive-steps');
    await assertInsertionAddsOne(page, 'insert-steps', steps);
  });

  test('Grid: clicking Insert Layout Grid adds a grid container to the slide', async ({
    page,
  }) => {
    const grid = page.getByTestId('directive-grid');
    await assertInsertionAddsOne(page, 'insert-grid', grid);
  });

  test('Layout Box: clicking Layout Box wraps the selection in a layout-box directive', async ({
    page,
  }) => {
    const layoutBox = page.getByTestId('directive-layout-box');
    await assertInsertionAddsOne(page, 'insert-layout-box', layoutBox);
  });

  test('Table: clicking Insert Table adds a 3x3 table to the slide', async ({
    page,
  }) => {
    // Table is rendered by MDXEditor's built-in tablePlugin, not a custom
    // directive — assert on the rendered <table> element inside our
    // editor container instead of a `directive-*` testid.
    const editor = page.getByTestId('rc5-visual-editor');
    const table = editor.locator('table');
    await assertInsertionAddsOne(page, 'insert-table', table);
  });

  test('Code Block: clicking Insert Code Block adds a CodeMirror code block to the slide', async ({
    page,
  }) => {
    // Code blocks are rendered by MDXEditor's codeBlockPlugin via CodeMirror;
    // the contenteditable surface uses the `.cm-editor` class.
    const editor = page.getByTestId('rc5-visual-editor');
    const codeBlock = editor.locator('.cm-editor');
    await assertInsertionAddsOne(page, 'insert-code-block', codeBlock);
  });

  test('Thematic Break: clicking Insert Thematic Break adds an <hr> to the slide', async ({
    page,
  }) => {
    // The sandbox welcome slide already contains ~10 `<hr>` separators
    // (one for every `---` in the seed markdown). The relative-count
    // pattern is critical here.
    const editor = page.getByTestId('rc5-visual-editor');
    const hr = editor.locator('hr');
    await assertInsertionAddsOne(page, 'insert-thematic-break', hr);
  });
});
