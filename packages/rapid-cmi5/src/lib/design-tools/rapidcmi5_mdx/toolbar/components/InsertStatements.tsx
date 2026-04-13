import {
  rootEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';
import type { LexicalEditor } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import SubjectIcon from '@mui/icons-material/Subject';

import { ContainerDirective } from 'mdast-util-directive';

import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@emotion/react';
import {
  ButtonMinorUi,
  StatementsSettings,
  StatementPreset,
  DEFAULT_STATEMENT,
} from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { useCallback, useState } from 'react';

/**
 * A toolbar button component that inserts a statements block into the editor.
 * @component
 * @returns A button with a tooltip labeled "Statements" and a subject icon.
 */
export const InsertStatements = ({ isDrawer }: { isDrawer?: boolean }) => {
  const editor = useCellValue(rootEditor$) as LexicalEditor | null;
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const theme: any = useTheme();
  const [isConfiguring, setIsConfiguring] = useState(false);

  /**
   * Inserts default Statements at the current selection.
   * Re-focuses the editor so Lexical restores its last known selection,
   * then runs the insert inside that callback.
   */
  const insertAtSelection = useCallback(
    (preset: string) => {
      if (!editor) return;

      editor.focus(() => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

          // create statements node
          const mdastStatements: ContainerDirective = {
            type: 'containerDirective',
            name: 'statements',
            attributes: {
              preset,
            },
            children: [
              {
                type: 'containerDirective',
                name: 'statement',
                attributes: {
                },
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        value: DEFAULT_STATEMENT,
                      },
                    ],
                  },
                ],
              },
            ],
          };

          const statementsNode = $createDirectiveNode(
            mdastStatements,
          ) as DirectiveNode;
          selection.insertNodes([statementsNode]);
        });
      });
    },
    [editor, syntaxExtensions],
  );

  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Saves changes by inserting new node.
   */
  const handleSelect = useCallback(
    (preset: StatementPreset) => {
      insertAtSelection(preset.id);
      setIsConfiguring(false);
    },
    [insertAtSelection],
  );

  /**
   * Set flag for configuring layout
   */
  const selectLayout = () => {
    if (!editor) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        setIsConfiguring(false);
        return;
      }
    });

    setIsConfiguring(true);
  };

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Statements"
          aria-label="insert-statements"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />

              <SubjectIcon
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
          Statements
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert Statements"
          aria-label="insert-statements"
          onClick={() => {
            selectLayout();
          }}
        >
          <SubjectIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
      {isConfiguring && (
        <StatementsSettings
          handleCancel={handleCancel}
          handleSubmit={handleSelect}
        />
      )}
    </>
  );
};
