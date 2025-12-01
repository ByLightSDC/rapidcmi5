import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  exportVisitors$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import {
  $getSelection,
  $setSelection,
  $isRangeSelection,
  $getNodeByKey,
  type LexicalEditor,
  LexicalNode,
} from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import ViewComfyIcon from '@mui/icons-material/ViewComfy';

import { exportMarkdownFromLexical } from '@rangeos-nx/ui/branded';

import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Options as ToMarkdownOptions } from 'mdast-util-to-markdown';

/**
 * Helper function to try to focus inside a directive over the course of a
 * defined number of frames.
 * @param editor
 * @param insertedKey
 * @param attempts
 */
function placeCaretInsideDirective(
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

const DEFAULT_MARKDOWN_OPTIONS: ToMarkdownOptions = {
  listItemIndent: 'one',
};

export const InsertLayoutBox = () => {
  const editor = useCellValue(activeEditor$);

  const [
    exportVisitors,
    jsxComponentDescriptors,
    jsxIsAvailable,
    syntaxExtensions,
  ] = useCellValues(
    exportVisitors$,
    jsxComponentDescriptors$,
    jsxIsAvailable$,
    syntaxExtensions$,
  );

  /**
   * Wraps the current selection or the entire block in a Layout Box container
   * directive.
   *
   * If there is an active selection (text is highlighted), wrap only the
   * selection.
   *
   * If the selection is collapsed (i.e. no text selected), wrap the entire
   * current block.
   *
   * If the content is empty, a default 'Layout Box' placeholder is used.
   */
  const wrapSelectionOrBlock = () => {
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const block = selection.anchor.getNode().getTopLevelElementOrThrow();

      let theNodes: LexicalNode[] = [];
      let replaceBlock = false;

      if (selection.isCollapsed()) {
        theNodes = [block];
        replaceBlock = true;
      } else if (selection.getTextContent() === block.getTextContent()) {
        theNodes = [block];
        replaceBlock = true;
      } else {
        // extract the selected nodes
        theNodes = selection.extract();
      }

      let theMarkDown = '';
      if (theNodes.length > 0) {
        const selectedKeys = new Set(theNodes.map((node) => node.getKey()));

        // filter to top-level nodes
        const topLevelNodes = theNodes.filter((node) => {
          const parent = node.getParent();
          return !parent || !selectedKeys.has(parent.getKey());
        });

        // export markdown from top-level nodes only
        for (const node of topLevelNodes) {
          const theNewMarkdownValue = exportMarkdownFromLexical({
            root: node,
            visitors: exportVisitors,
            jsxComponentDescriptors,
            toMarkdownExtensions: [],
            toMarkdownOptions: DEFAULT_MARKDOWN_OPTIONS,
            jsxIsAvailable,
          });
          theMarkDown += theNewMarkdownValue;
        }
      }

      // fallback for empty content
      if (!theMarkDown.trim()) {
        theMarkDown = 'Layout Box';
      }

      const theChildMDast = fromMarkdown(theMarkDown, {
        extensions: syntaxExtensions,
        mdastExtensions: null,
      });

      const mdast: ContainerDirective = {
        type: 'containerDirective',
        name: 'layout',
        attributes: {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const dir = $createDirectiveNode(mdast) as DirectiveNode;

      if (replaceBlock) {
        // for whole block, replace it entirely
        $setSelection(null);
        theNodes[0].replace(dir); // theNodes[0] is the block
      } else {
        // for selection, insert in place
        selection.insertNodes([dir]);
      }

      // move caret inside the new directive
      const insertedKey = dir.getKey();
      placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <ButtonWithTooltip
      title="Layout Box"
      onClick={() => {
        wrapSelectionOrBlock();
      }}
    >
      <ViewComfyIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};
