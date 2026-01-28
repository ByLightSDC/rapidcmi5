import {
  ButtonWithTooltip,
  activeEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import ViewStreamIcon from '@mui/icons-material/ViewStream';


import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { placeCaretInsideDirective } from '../../util/caret';
import { convertMarkdownToMdast } from '../../util/conversion';

/** The first line return is REQUIRED!!!! */
const DEFAULT_ACCORDION = `
:::accordionContent{title="Accordion 1 Title"}

Accordion 1 Content Goes Here
:::

:::accordionContent{title="Accordion 2 Title"}

Accordion 2 Content Goes Here
:::

:::accordionContent{title="Accordion 3 Title"}

Accordion 3 Content Goes Here
:::`;

/**
 * A toolbar button component that inserts an accordion structure into the editor.
 * @component
 * @returns A button with a tooltip labeled "Accordion" and an Accordion icon.
 */
export const InsertAccordion = () => {
  const editor = useCellValue(activeEditor$);
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);

  /**
   * Inserts default Accordion at the current selection
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
        DEFAULT_ACCORDION,
        syntaxExtensions,
      );

      // create accordion node
      const mdastAccordion: ContainerDirective = {
        type: 'containerDirective',
        name: 'accordion',
        attributes: {
          style: 'margin: 4px;',
        },
        children: (theChildMDast?.children as BlockContent[]) || [],
      };

      const accordionNode = $createDirectiveNode(
        mdastAccordion,
      ) as DirectiveNode;
      selection.insertNodes([accordionNode]);
      const insertedKey = accordionNode.getKey();
      placeCaretInsideDirective(editor, insertedKey);
    });
  };

  return (
    <ButtonWithTooltip
      title="Insert Accordion"
      aria-label="insert-accordion"
      onClick={() => {
        insertAtSelection();
      }}
    >
      <ViewStreamIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};
