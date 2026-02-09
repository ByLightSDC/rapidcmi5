import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import GridViewIcon from '@mui/icons-material/GridView';

import { convertMarkdownToMdast } from '../../util/conversion';
import { placeCaretInsideDirective } from '../../util/caret';

import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { DEFAULT_GRID } from './constants';

/**
 * Checks if the current selection is inside a grid container or grid cell.
 * Used to prevent nested grids.
 */
const isInsideGrid = (editor: any): boolean => {
  let result = false;

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    let node = selection.anchor.getNode();

    // Traverse up the tree to check for grid directives
    while (node) {
      const parent = node.getParent();
      if (!parent) break;

      // Check if parent is a DirectiveNode with grid-related name
      if (parent.getType && parent.getType() === 'directive') {
        const directiveNode = parent as unknown as DirectiveNode;
        const mdastNode = directiveNode.getMdastNode();
        if (
          mdastNode &&
          (mdastNode.name === 'gridContainer' || mdastNode.name === 'grid')
        ) {
          result = true;
          return;
        }
      }

      node = parent;
    }
  });

  return result;
};

/**
 * A toolbar button component that inserts a grid layout into the editor.
 * @component
 * @returns A button with a tooltip labeled "Insert Layout Grid" and a grid icon.
 */
export const InsertGrid = () => {
  const editor = useCellValue(activeEditor$);
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);

  /**
   * Inserts default Grid at the current selection.
   * If selection is not collapsed or inside an existing grid, nothing is inserted.
   */
  const insertAtSelection = () => {
    if (!editor) return;

    // Prevent nested grids
    if (isInsideGrid(editor)) {
      console.warn('Cannot insert grid inside another grid');
      return;
    }

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (selection.isCollapsed()) {
        // Continue
      } else {
        return; // No applying grid to selection
      }

      // Create children grid cell nodes
      const theChildMDast = convertMarkdownToMdast(
        DEFAULT_GRID,
        syntaxExtensions,
      );

      // Create grid container node with default style
      const mdastGrid: ContainerDirective = {
        type: 'containerDirective',
        name: 'gridContainer',
        attributes: {
          style: 'margin: 4px;',
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const gridNode = $createDirectiveNode(mdastGrid) as DirectiveNode;
      selection.insertNodes([gridNode]);
      const insertedKey = gridNode.getKey();
      placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <ButtonWithTooltip
      title="Insert Layout Grid"
      aria-label="insert-layout-grid"
      onClick={() => {
        insertAtSelection();
      }}
    >
      <GridViewIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};
