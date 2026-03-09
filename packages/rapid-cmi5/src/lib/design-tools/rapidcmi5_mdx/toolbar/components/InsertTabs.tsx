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
import { ButtonMinorUi } from 'packages/ui/src/lib/utility/buttons';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@emotion/react';
import { DEFAULT_TABS } from 'packages/ui/src/lib/cmi5/mdx/plugins/tabs/constants';
import { convertMarkdownToMdast } from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * A toolbar button component that inserts a tab structure into the editor.
 * @component
 * @returns A button with a tooltip labeled "Tabs" and a tab icon.
 */
export const InsertTabs = ({ isDrawer }: { isDrawer?: boolean }) => {
  const editor = useCellValue(activeEditor$);
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const theme: any = useTheme();
  
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
          style: 'margin: 4px;',
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const tabsNode = $createDirectiveNode(mdastTabs) as DirectiveNode;
      console.log('selection', selection);
      selection.insertNodes([tabsNode]);
      //REF don't do this unless you want to get the cursor eaten
      //see CCUI-2768, 2779, 2769
      //const insertedKey = tabsNode.getKey();
      //placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Tabs"
          aria-label="insert-tabs"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />

              <TabIcon
                fontSize="small"
                sx={{ fill: theme.palette.primary.main, marginRight: 1 }}
              />
            </>
          }
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            margin: 1,
            padding: 1,
          }}
          onClick={() => {
            insertAtSelection();
          }}
        >
          Tabs
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert Tabs"
          aria-label="insert-tabs"
          onClick={() => {
            insertAtSelection();
          }}
        >
          <TabIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
    </>
  );
};
