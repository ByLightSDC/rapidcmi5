import { DirectiveDescriptor } from '@mdxeditor/editor';
import { GridCellEditor, GridCellDirectiveNode } from '@rapid-cmi5/ui';

/**
 * Grid Cell directive descriptor for use in the visual editor (course builder).
 *
 * Uses GridCellEditor, which renders with role="gridcell" — the correct ARIA
 * role inside a grid widget where cells are interactive editing targets.
 *
 * This is intentionally separate from the player-side GridCellDirectiveDescriptor,
 * which uses GridCellPlayback with role="cell" (CCUI-2828: avoids NVDA announcing
 * every cell as "clickable" in read-only playback mode).
 */
export const GridCellEditorDescriptor: DirectiveDescriptor<GridCellDirectiveNode> =
  {
    name: 'grid',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'grid';
    },
    attributes: ['size', 'textAlign'],
    hasChildren: true,
    Editor: GridCellEditor,
  };
