import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import TabIcon from '@mui/icons-material/Tab';

import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { DEFAULT_TABS } from './constants';
import { placeCaretInsideDirective } from '../../util/caret';
import { convertMarkdownToMdast } from '../../util/conversion';



/**
 * A toolbar button component that inserts a tab structure into the editor.
 * @component
 * @returns A button with a tooltip labeled "Tabs" and a tab icon.
 */
export const InsertTabs = () => {
  const editor = useCellValue(activeEditor$);
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);

  /**
   * Inserts default Tabs at the current selection
   * If it is NOT empty, nothing is inserted
   */
  const insertAtSelection = () => {
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (selection.isCollapsed()) {
        //continue
      } else {
        return; //no applying tab to selection
      }

      // create children tabs content nodes 
      const theChildMDast = convertMarkdownToMdast(
        DEFAULT_TABS,
        syntaxExtensions,
      );

      // create tabs node with default style
      const mdastTabs: ContainerDirective = {
        type: 'containerDirective',
        name: 'tabs',
        attributes: {
          style: "margin: 4px;",
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const tabsNode = $createDirectiveNode(mdastTabs) as DirectiveNode;
      selection.insertNodes([tabsNode]);
      const insertedKey = tabsNode.getKey();
      placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <ButtonWithTooltip
      title="Insert Tabs"
      aria-label="insert-tabs"
      onClick={() => {
        insertAtSelection();
      }}
    >
      <TabIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};
