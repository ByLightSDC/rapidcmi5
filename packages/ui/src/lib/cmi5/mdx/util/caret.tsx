import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  exportVisitors$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  syntaxExtensions$,
  $isDirectiveNode,
} from '@mdxeditor/editor';

import {
  $getSelection,
  $setSelection,
  $isRangeSelection,
  $getNodeByKey,
  type LexicalEditor,
  LexicalNode,
  TextNode,
  ElementNode,
} from 'lexical';
import { MutableRefObject } from 'react';

/**
 * Methods for selection
 * RangeSelection - User has a caret or highlighted text
 */

/**
 * Helper function to try to focus inside a directive over the course of a
 * defined number of frames.
 * @param editor
 * @param insertedKey
 * @param attempts
 */
export function placeCaretInsideDirective(
  editor: LexicalEditor,
  insertedKey: string,
  attempts = 0,
) {
  if (attempts > 6) return; // give up after ~6 frames

  requestAnimationFrame(() => {
    editor.update(() => {
      const node = $getNodeByKey<DirectiveNode>(insertedKey);
      if (!node) {
        placeCaretInsideDirective(editor, insertedKey, attempts + 1);
        return;
      }

      // enter the directive’s inner editable content
      (node as any).select?.();

      // if the inner structure is available, move the caret to the end of the first paragraph
      const firstChild = (node as any).getFirstChild?.();
      if (firstChild?.selectEnd) {
        firstChild.selectEnd();
      } else {
        // Try again next frame until children exist
        placeCaretInsideDirective(editor, insertedKey, attempts + 1);
      }
    });
  });
}

//REF

// export function isSelectionInsideDirective(
//   selectedDirectiveNode?: MutableRefObject<TextNode | ElementNode | null>,
//   directiveType?: string,
// ): boolean {
//   console.log('is SelectionInsideDirective');
//   const selection = $getSelection();

//   if (!$isRangeSelection(selection)) {
//     console.log('no range selection', selection);
//     return false;
//   }

//   const anchorNode = selection.anchor.getNode();
//   console.log('B start node', anchorNode);
//   // Walk up the tree to see if any parent is a directive
//   let node: TextNode | ElementNode | null = anchorNode;
//   while (node) {
//     if ($isDirectiveNode(node)) {
//       if (directiveType) {
//         if (directiveType !== node.getType()) {
//           if (selectedDirectiveNode) {
//             selectedDirectiveNode.current = null;
//           }
//           return false;
//         }
//       }
//       if (selectedDirectiveNode) {
//         selectedDirectiveNode.current = node;
//       }
//       return true;
//     }
//     node = node.getParent();
//     console.log('check parent', node);
//   }

//   console.log('C found nothing');
//   if (selectedDirectiveNode) {
//     selectedDirectiveNode.current = null;
//   }
//   return false;
// }
