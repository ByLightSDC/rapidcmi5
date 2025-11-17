import { $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import {
  $createParagraphNode,
  $createRangeSelection,
  $insertNodes,
  $isNodeSelection,
  $setPointFromCaret,
  $setSelection,
  $setSelectionFromCaretRange,
} from 'lexical';
import {
  activePlugins$,
  allowedHeadingLevels$,
  convertSelectionToNode$,
  currentBlockType$,
  Select,
  useTranslation,
} from '@mdxeditor/editor';
import {
  $createFootnoteReferenceNode,
  $createTocHeadingNode,
  githubSlugger$,
} from '@rangeos-nx/ui/branded';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';

type RC5BlockType = '' | 'paragraph' | 'quote' | HeadingTagType | 'footnote';

/**
 * A toolbar component that allows the user to change the block type of the current selection.
 * Supports paragraphs, headings and block quotes.
 * @group Toolbar Components
 */
export const BlockTypeSelect = () => {
  const convertSelectionToNode = usePublisher(convertSelectionToNode$);
  const currentBlockType = useCellValue(currentBlockType$);
  const activePlugins = useCellValue(activePlugins$);
  const hasQuote = activePlugins.includes('quote');
  const hasFootnotes = activePlugins.includes('footnotes');
  const hasHeadings = activePlugins.includes('headings');
  const t = useTranslation();
  const [editor] = useLexicalComposerContext();

  if (!hasQuote && !hasHeadings && !hasFootnotes) {
    return null;
  }
  const items: { label: string | JSX.Element; value: RC5BlockType }[] = [
    {
      label: t('toolbar.blockTypes.paragraph', 'Paragraph'),
      value: 'paragraph',
    },
  ];

  if (hasQuote) {
    items.push({
      label: t('toolbar.blockTypes.quote', 'Quote'),
      value: 'quote',
    });
  }

  if (hasFootnotes) {
    items.push({
      label: 'Footnote',
      value: 'footnote',
    });
  }

  if (hasHeadings) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const allowedHeadingLevels = useCellValue(allowedHeadingLevels$);
    items.push(
      ...allowedHeadingLevels.map(
        (n) =>
          ({
            label: t('toolbar.blockTypes.heading', 'Heading {{level}}', {
              level: n,
            }),
            value: `h${n}`,
          }) as const,
      ),
    );
  }

  return (
    <Select<RC5BlockType>
      value={currentBlockType}
      onChange={(blockType) => {
        switch (blockType) {
          case 'footnote':
            editor.update(() => {
              // create a unique id using epoch time so we dont have to traverse for numbering
              const label = 'fn' + Math.trunc(Date.now() / 1000.0);
              const refNode = $createFootnoteReferenceNode({ label });
              const selection = $getSelection();
              // ensure selection is an insert and not a replace
              if ($isRangeSelection(selection)) {
                //when a range is selected, convert to single point insert
                if (!selection.isCollapsed()) {
                  selection.focus.set(
                    selection.anchor.key,
                    selection.anchor.offset,
                    'text',
                  );
                  $setSelection(selection);
                } 
                $insertNodes([refNode]);
              } else if ($isNodeSelection(selection)) {
                if (selection !== null) {
                  //when a node is selected, insert footnote before it
                  const targetNode = selection.getNodes()[0];
                  // Insert the new node before the targetNode
                  targetNode.insertBefore(refNode);
                }
              }
            });
            break;
          case 'quote':
            convertSelectionToNode(() => $createQuoteNode());
            break;
          case 'paragraph':
            convertSelectionToNode(() => $createParagraphNode());
            break;

          case '':
            break;

          default:
            if (blockType.startsWith('h')) {
              editor.update(() => {
                const selection = $getSelection();
                let headingText = '';

                if ($isRangeSelection(selection)) {
                  headingText = selection.getTextContent(); // Get selected text
                }

                convertSelectionToNode(() =>
                  $createTocHeadingNode(
                    blockType,
                    githubSlugger$.slug(headingText),
                  ),
                );
              });
            } else {
              throw new Error(`Unknown block type: ${blockType}`);
            }
        }
      }}
      triggerTitle={t(
        'toolbar.blockTypeSelect.selectBlockTypeTooltip',
        'Select block type',
      )}
      placeholder={t('toolbar.blockTypeSelect.placeholder', 'Block type')}
      items={items}
    />
  );
};
