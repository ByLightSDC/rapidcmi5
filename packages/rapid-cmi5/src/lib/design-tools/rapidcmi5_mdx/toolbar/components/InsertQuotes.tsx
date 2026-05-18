import {
  rootEditor$,
  $createDirectiveNode,
  DirectiveNode,
  syntaxExtensions$,
} from '@mdxeditor/editor';

import { $getSelection, $isRangeSelection } from 'lexical';
import type { LexicalEditor } from 'lexical';

import { useCellValue, useCellValues } from '@mdxeditor/gurx';

import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

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
  DEFAULT_QUOTES,
  QuotePreset,
} from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { useCallback, useContext, useState } from 'react';
import { join } from 'path-browserify';
import { useSelector } from 'react-redux';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';
import { currentAuPath } from '../../../../redux/courseBuilderReducer';
import quoteAuthorPlaceholder from './assets/quoteAuthorPlaceholder.png';

const PLACEHOLDER_AVATAR_DIR = 'Assets/Images';
const PLACEHOLDER_AVATAR_FILENAME = 'quoteAuthorPlaceholder.png';
const PLACEHOLDER_AVATAR_REL = `./${PLACEHOLDER_AVATAR_DIR}/${PLACEHOLDER_AVATAR_FILENAME}`;
import { useSelectionHelper } from '../../../../hooks/useSelectionHelper';

/**
 * A toolbar button component that inserts a quotes into the editor.
 * @component
 * @returns A button with a tooltip labeled "Quotes" and a quote icon.
 */
export const InsertQuotes = ({ isDrawer }: { isDrawer?: boolean }) => {
  const editor = useCellValue(rootEditor$) as LexicalEditor | null;
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const theme: any = useTheme();
  const selectionHelper = useSelectionHelper();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const auPath = useSelector(currentAuPath);
  const { handleCreateFile, handlePathExists, handleStageFile } =
    useContext(GitContext);

  /**
   * If the user didn't pick an avatar, write the bundled placeholder PNG into
   * the current lesson's Assets/Images/ folder (only when it isn't there yet)
   * and return the lesson-relative path to reference from MDX.
   */
  const ensureDefaultAvatar = useCallback(async (): Promise<string> => {
    if (!auPath) throw Error('No AU Path was found.');

    // The location of where the default avatar will be placed
    const relPath = join(
      auPath,
      PLACEHOLDER_AVATAR_DIR,
      PLACEHOLDER_AVATAR_FILENAME,
    );

    const exists = await handlePathExists(relPath);
    if (!exists) {
      // download from assets folder and upload to the local file system
      const res = await fetch(quoteAuthorPlaceholder);
      const buf = await res.arrayBuffer();
      await handleCreateFile(relPath, false, new Uint8Array(buf));
      await handleStageFile(relPath);
    }
    return PLACEHOLDER_AVATAR_REL;
  }, [auPath, handlePathExists, handleCreateFile, handleStageFile]);

  /**
   * Inserts default Quotes at the current selection
   * If it is NOT empty, nothing is inserted
   */
  const insertAtSelection = useCallback(
    (preset: string, avatar?: string) => {
      if (!editor) return;

      // Re-focus the editor so Lexical restores its last known selection,
      // then run the insert inside that callback.
      editor.focus(() => {
        editor.update(() => {
          let selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
          selection = selectionHelper.getInsertSelection(selection);

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
              attributes: { ...quoteContent.attributes, avatar },
            };
          }

          // create quotes node
          const mdastQuotes: ContainerDirective = {
            type: 'containerDirective',
            name: 'quotes',
            attributes: {
              preset,
              style: 'margin: 4px;',
            },
            children: [quoteContent],
          };

          const quotesNode = $createDirectiveNode(mdastQuotes) as DirectiveNode;
          selection.insertNodes([quotesNode]);
        });
      });
    },
    [editor, syntaxExtensions],
  );

  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Saves changes by inserting new node and removing original.
   */
  const handleSelect = useCallback(
    async (preset: QuotePreset, avatar: string) => {
      let finalAvatar = avatar;
      // Inject the default quote image if none was selected
      if (!finalAvatar) {
        finalAvatar = await ensureDefaultAvatar();
      }
      insertAtSelection(preset.id, finalAvatar);
      setIsConfiguring(false);
    },
    [insertAtSelection, ensureDefaultAvatar],
  );

  /**
   * Set flag for configuring layout
   * @returns
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
