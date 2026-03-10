import {
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';
import { useCellValue, useCellValues } from '@mdxeditor/gurx';
import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { convertMarkdownToMdast, DEFAULT_STEPS, ButtonMinorUi} from '@rapid-cmi5/ui';
import { useTheme } from '@emotion/react';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import InputIcon from '@mui/icons-material/Input';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * A toolbar button component that inserts a stepper structure into the editor.
 * @component
 * @returns A button with a tooltip labeled "Insert Stepper" and a stepper icon.
 */
export const InsertSteps = ({ isDrawer }: { isDrawer?: boolean }) => {
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
        DEFAULT_STEPS,
        syntaxExtensions,
      );

      // create tabs node with default style
      const mdastTabs: ContainerDirective = {
        type: 'containerDirective',
        name: 'steps',
        attributes: {
          style: 'margin: 4px;',
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const stepsNode = $createDirectiveNode(mdastTabs) as DirectiveNode;
      selection.insertNodes([stepsNode]);
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
          title="Insert Steps"
          aria-label="insert-steps"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <InputIcon
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
          Stepper
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert Steps"
          aria-label="insert-steps"
          onClick={() => {
            insertAtSelection();
          }}
        >
          <InputIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
    </>
  );
};
