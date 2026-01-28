import { useCallback, useEffect, useState } from 'react';
import {
  ButtonWithTooltip,
  activeEditor$,
  Cell,
  DirectiveNode,
  exportVisitors$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  syntaxExtensions$,
  $createDirectiveNode,
} from '@mdxeditor/editor';
import {
  useCellValue,
  useCellValues,
  usePublisher,
  useRealm,
} from '@mdxeditor/gurx';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  LexicalNode,
} from 'lexical';

/* mdast */
import type { PhrasingContent } from 'mdast';
import {

  directiveToMarkdown,
} from 'mdast-util-directive';
import { Options as ToMarkdownOptions } from 'mdast-util-to-markdown';
import {  mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { TextDirective } from 'mdast-util-directive';
import { fromMarkdown } from 'mdast-util-from-markdown';

import { TextFxPopover } from './TextFxPopover';



/** MUI  */
import RttIcon from '@mui/icons-material/Rtt';
import { Stack } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useSelector } from 'react-redux';
import { FxDirectiveAttributes, DEFAULT_SHAPE, selFxNode$, showTextFx$, refreshDelay, debugLog, exportMarkdownFromLexical, defaultToMarkdownExtensions, convertMarkdownToMdast, placeCaretInsideDirective, refreshTextFx$, defaultFxColor } from '@rapid-cmi5/ui';
import { dirtyDisplay } from 'packages/rapid-cmi5/src/lib/redux/courseBuilderReducer';

export const shapeStyleLast$ = Cell<FxDirectiveAttributes>(DEFAULT_SHAPE);

/**
 * Pops open Text Fx options for wrapping content with Rough Notation special fx
 *
 * @constructor
 */
export function TextFxButton() {
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
  const selFxNode = useCellValue(selFxNode$);
  const publishShowFx = usePublisher(showTextFx$);
  const realm = useRealm();
  const dirtyDisplayCount = useSelector(dirtyDisplay);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const disabled = !editor;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const DEFAULT_MARKDOWN_OPTIONS: ToMarkdownOptions = {
    emphasis: '*',
    listItemIndent: 'one',
    strong: '*',
  };

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const storeTarget = e.currentTarget;
    setAnchorEl(storeTarget);
  }, []);

  const closePicker = useCallback(() => setAnchorEl(null), []);

  /**
   * Force redraw of rough notation fx
   */
  const onRefreshFx = useCallback(async () => {
    publishShowFx(false);
    await delay(refreshDelay);
    publishShowFx(true);
  }, [publishShowFx]);

  /**
   * Apply shape styling to a selection of text
   * there is no direct method to convert from lexical to mdast, so you have to bridge to markdown first
   * */
  const InsertTextFx = useCallback(
    (shape: FxDirectiveAttributes | null) => {
      if (!editor) {
        debugLog('No Editor');
        return;
      }
      if (selFxNode) {
        debugLog('Fx Already Exists');
        return;
      }
      if (!shape) {
        debugLog('No Fx Selected');
        return;
      }
      editor.update(() => {
        //selection inside fx
        const selection = $getSelection();
        if (!selection) {
          debugLog('No Selection');
          return;
        }
        if (!$isRangeSelection(selection)) {
          debugLog('No Selection Range');
          return;
        }

        //get top level element from current selection
        const block = selection.anchor.getNode().getTopLevelElementOrThrow();

        const tt = block.getType();
        if (tt !== 'paragraph' && tt !== 'heading' && tt !== 'toc-heading') {
          debugLog('block must be a paragraph or a heading was ', tt);
          return;
        }

        let theNodes: LexicalNode[] = [];
        let replaceBlock = false;

        if (selection.isCollapsed()) {
          debugLog('Selection Collapsed - Nothing to Apply To');
          return;
        } else if (selection.getTextContent() === block.getTextContent()) {
          //must be paragraph node
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
              toMarkdownExtensions: defaultToMarkdownExtensions,
              toMarkdownOptions: DEFAULT_MARKDOWN_OPTIONS,
              jsxIsAvailable,
            });
            //REF console.log('theNewMarkdownValue *' + theNewMarkdownValue + '*');
            //export method adds line return on every markdowns string regardless on node type
            //remove these extra line feeds
            theMarkDown += theNewMarkdownValue.replace(/[\r\n]+$/, '');
          }
        }

        const theChildMDast = convertMarkdownToMdast(
          theMarkDown,
          syntaxExtensions,
        );

        //console.log('theChildMDast', theChildMDast);

        //create new text directive
        //must cast mast children to the correct type based on mdast type
        const mdast: TextDirective = {
          type: 'textDirective',
          name: 'fx',
          attributes: {
            type: shape.type as string,
            color: shape.color,
          },
          children: (theChildMDast?.children as PhrasingContent[]) || [],
        };

        //create a paragraph node with the fx directive now
        const dir = $createDirectiveNode(mdast) as DirectiveNode;

        if (replaceBlock) {
          // for whole block, replace it entirely
          // you must replace the pragraph to preserve the line return
          const paragraph = $createParagraphNode();
          paragraph.append(dir);

          $setSelection(null);
          theNodes[0].replace(paragraph);
        } else {
          // for selection, insert in place
          selection.insertNodes([dir]);
        }

        // move caret inside the new directive
        const insertedKey = dir.getKey();
        //console.log(' move caret', insertedKey);
        placeCaretInsideDirective(editor, insertedKey);
        onRefreshFx();
      });
    },
    [editor, selFxNode],
  );

  /**
   * UE registers refresh fxn with the realm
   */
  useEffect(() => {
    realm.pub(refreshTextFx$, onRefreshFx);
  }, []);

  useEffect(() => {
    if (dirtyDisplayCount > 1) {
      onRefreshFx();
    }
  }, [dirtyDisplayCount, onRefreshFx]);

  return (
    <>
      <ButtonWithTooltip
        //style={{ minWidth: '64px' }}
        title={'Text Fx'}
        onClick={openPicker}
        disabled={disabled}
        aria-label="Text Fx"
      >
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <RttIcon
            fontSize="small"
            //TODO style={{ color: lastShape?.borderColor || 'black' }}
          />
          <CircleIcon
            style={{
              //backgroundColor: 'pink',
              fontSize: '14px',
              padding: 0,
              margin: 0,
              marginLeft: -2,
              //position: 'absolute',
              color: selFxNode?.attributes.color || defaultFxColor,
            }}
          />
        </Stack>
      </ButtonWithTooltip>

      <TextFxPopover
        anchorEl={anchorEl}
        onClose={closePicker}
        onApplyNew={InsertTextFx}
      />
    </>
  );
}
