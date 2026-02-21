import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import InputIcon from '@mui/icons-material/Input';

import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { DEFAULT_STEPS } from './constants';
import { placeCaretInsideDirective } from '../../util/caret';
import { convertMarkdownToMdast } from '../../util/conversion';



/**
 * A toolbar button component that inserts a tab structure into the editor.
 * @component
 * @returns A button with a tooltip labeled "Tabs" and a tab icon.
 */
export const InsertSteps = () => {
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
        DEFAULT_STEPS,
        syntaxExtensions,
      );

      // create tabs node with default style
      const mdastTabs: ContainerDirective = {
        type: 'containerDirective',
        name: 'steps',
        attributes: {
          style: "margin: 4px;",
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const stepsNode = $createDirectiveNode(mdastTabs) as DirectiveNode;
      selection.insertNodes([stepsNode]);
      const insertedKey = stepsNode.getKey();
      placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <ButtonWithTooltip
      title="Insert Stepper"
      aria-label="insert-steps"
      onClick={() => {
        insertAtSelection();
      }}
    >
      <InputIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};
