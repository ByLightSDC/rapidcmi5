import {
  ButtonWithTooltip,
  rootEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';
import type { LexicalEditor } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TabIcon from '@mui/icons-material/Tab';

import type { BlockContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@emotion/react';
import {
  convertMarkdownToMdast,
  ButtonMinorUi,
  QuotesSettings,
  debugLogWarning,
} from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { useCallback, useState } from 'react';
import { QuotePreset } from 'packages/ui/src/lib/cmi5/mdx/plugins/quotes/types';
import { DEFAULT_QUOTES } from 'packages/ui/src/lib/cmi5/mdx/plugins/quotes/constants';

/**
 * A toolbar button component that inserts a quotes into the editor.
 * @component
 * @returns A button with a tooltip labeled "Quotes" and a quote icon.
 */
export const InsertQuotes = ({ isDrawer }: { isDrawer?: boolean }) => {
  const editor = useCellValue(rootEditor$) as LexicalEditor | null;
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const theme: any = useTheme();
  const [isConfiguring, setIsConfiguring] = useState(false);

  /**
   * Inserts default Quotes at the current selection
   * If it is NOT empty, nothing is inserted
   */
  const insertAtSelection = (preset: string, avatar?: string) => {
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (selection.isCollapsed()) {
        //continue
      } else {
        debugLogWarning('Cannot insert quotes into selection');
        return; //no applying quote to selection
      }

      // create child quotes content
      const theChildMDast = convertMarkdownToMdast(
        DEFAULT_QUOTES,
        syntaxExtensions,
      );
      // set avatar based on current settings
      let quoteContent = theChildMDast.children[0] as ContainerDirective;
      if (avatar) {
        quoteContent = {
          ...quoteContent,
          attributes: { ...quoteContent.attributes, avatar: avatar },
        };
      }

      // create quotes node
      const mdastQuotes: ContainerDirective = {
        type: 'containerDirective',
        name: 'quotes',
        attributes: {
          preset: preset,
          style: 'margin: 4px;',
        },
        children: [quoteContent],
      };


      const quotesNode = $createDirectiveNode(mdastQuotes) as DirectiveNode;
      selection.insertNodes([quotesNode]);
    });
  };

  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Saves changes by inserting new node and removing original.
   */
  const handleSelect = useCallback((preset: QuotePreset, avatar: string) => {
    insertAtSelection(preset.id, avatar);
    setIsConfiguring(false);
  }, []);

  const selectLayout = () => {
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (selection.isCollapsed()) {
        //continue
      } else {
        return; //no applying tab to selection
      }
    });

    setIsConfiguring(true);
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

              <FormatQuoteIcon
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
            selectLayout();
          }}
        >
          Quotes
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert Quotes"
          aria-label="insert-quotes"
          onClick={() => {
            selectLayout();
          }}
        >
          <FormatQuoteIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
      {isConfiguring && (
        <QuotesSettings
          handleCancel={handleCancel}
          handleSubmit={handleSelect}
        />
      )}
    </>
  );
};
