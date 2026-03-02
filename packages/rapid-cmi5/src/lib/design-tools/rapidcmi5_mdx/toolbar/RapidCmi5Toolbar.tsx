import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import ReactDOM from 'react-dom';

import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertThematicBreak,
  ListsToggle,
  ShowSandpackInfo,
  StrikeThroughSupSubToggles,
  DirectiveNode,
  EditorInFocus,
  ConditionalContents,
  Separator,
  usePublisher,
  viewMode$,
  useCellValue,
  useRealm,
  UndoRedo,
  ButtonWithTooltip,
  iconComponentFor$,
  useCellValues,
  useTranslation,
  IS_STRIKETHROUGH,
  IS_BOLD,
  IS_ITALIC,
  IS_UNDERLINE,
} from '@mdxeditor/editor';
import { CLEAR_HISTORY_COMMAND } from 'lexical';
//import { InsertActivity } from './components/InsertActivity';
import { InsertImage } from './components/InsertImage';
import { InsertVideo } from './components/InsertVideo';
import { InsertLayoutBox } from './components/InsertLayoutBox';

/** Icons */
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PaletteIcon from '@mui/icons-material/Palette';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import WidgetsIcon from '@mui/icons-material/Widgets';

import { Box, IconButton, Stack, Tooltip } from '@mui/material';

import { InsertAdmonition } from './components/InsertAdmonition';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../styles/styles';

import { useSelector } from 'react-redux';
import { BlockTypeSelect } from './components/BlockTypeSelect';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RC5Context } from '../contexts/RC5Context';
import { ColorTextSplitButton } from './components/ColorTextSplitButton';
import { HighlightSplitButton } from './components/HighlightSplitButton';
import { TextFxButton } from './components/TextFxButton';
import { InsertAudio } from './components/InsertAudio';
import { InsertTable } from './components/InsertTable';
import { InsertAnimation } from './components/InsertAnimation';
import {
  AdmonitionTypeEnum,
  AdmonitionTypes,
  ActivityType,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import {
  editorInPlayback$,
  CONTENT_UPDATED_COMMAND,
  InsertTabs,
  InsertAccordion,
  dividerColor,
  iconColor,
  InsertGrid,
  InsertSteps,
} from '@rapid-cmi5/ui';
import { displayData } from '../../../redux/courseBuilderReducer';
import { SlideMenu } from '../menu/SlideMenu';
import { InsertBlockMenu } from './components/InsertBlockMenu';
import { ModePreviewButton } from './components/ModePreviewButton';
import { SaveSlideButton } from './components/SaveSlideButton';
import { LessonStyleButton } from './components/LessonStyleButton';
import { InsertFile } from './components/InsertFile';
import { FormatButton } from './components/FormatButton';
import styles from './styles/toolbar.module.css';

/**
 * A toolbar component that includes all toolbar components.
 * Notice that some of the buttons will work only if you have the corresponding plugin enabled, so you should use it only for testing purposes.
 * You'll probably want to create your own toolbar component that includes only the buttons that you need.
 * @group Toolbar Components
 */
export const RapidCmi5Toolbar: React.FC = () => {
  const changeViewMode = usePublisher(viewMode$);
  const { getMarkdownData } = useContext(RC5Context);
  const realm = useRealm();
  const viewmode = useCellValue(viewMode$);
  const themedDividerColor = useSelector(dividerColor);
  const content = useSelector(displayData);
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [leftToolbarPos, setLeftToolbarPos] = useState<number | 0>(0);
  const [isMoreTextTools, setIsMoreTextTools] = useState(false);
  const [viewMode, iconComponentFor] = useCellValues(
    viewMode$,
    iconComponentFor$,
  );
  const t = useTranslation();

  /**
   * UE sets view to Rich Text Editor on mount
   */
  useEffect(() => {
    realm.pub(editorInPlayback$, false);
    changeViewMode('rich-text');
  }, []);

  useEffect(() => {
    if (getMarkdownData() !== content) {
      editor.dispatchCommand(CONTENT_UPDATED_COMMAND, undefined);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    }
  }, [content]);

  useEffect(() => {
    console.log('viewmode', viewmode);
  }, [viewmode]);

  /**
   * Prevent mode buttons from positioning off screen
   * Mode button parent div has a width that is calculated by screen width minus toolbar left adjusted to create a right margin
   * Observer ensures it gets updated when the lesson drawer is resized byt he user
   */
  useLayoutEffect(() => {
    if (!toolbarRef.current) return;

    const measure = () => {
      if (toolbarRef.current) {
        // Get the position relative to the viewport
        const rect = toolbarRef.current.getBoundingClientRect();
        // Calculate the absolute position relative to the document
        const left = rect.left + window.scrollX;
        //tool bar left plus margin
        setLeftToolbarPos(left + 12);
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(toolbarRef.current);

    return () => observer.disconnect();

    // Ensure the ref is attached to a DOM element and that element exists
  }, []);

  return (
    <Box
      ref={toolbarRef}
      sx={{
        backgroundColor: 'background.default',
        width: '100%',
        minHeight: '40px',
        borderBottom: `1px solid ${themedDividerColor}`,
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Scroll container */}
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Stack direction="column" spacing={1} sx={{ padding: 1 }}>
          {viewmode === 'rich-text' && (
            <Stack direction="row" spacing={1}>
              <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                <BoldItalicUnderlineToggles />
                <Stack
                  direction="row"
                  sx={{
                    borderColor: isMoreTextTools ? 'divider' : 'transparent',
                    borderRadius: 1,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ButtonWithTooltip
                    title={
                      isMoreTextTools
                        ? 'Less Text Tools...'
                        : 'More Text Tools...'
                    }
                    onClick={() => setIsMoreTextTools(!isMoreTextTools)}
                  >
                    {isMoreTextTools ? (
                      <UnfoldLessIcon fontSize="medium" />
                    ) : (
                      <UnfoldMoreIcon fontSize="medium" />
                    )}
                  </ButtonWithTooltip>
                  {isMoreTextTools && <StrikeThroughSupSubToggles />}
                </Stack>
                <ColorTextSplitButton />
                <HighlightSplitButton />
                <TextFxButton />
                <Separator />
                <CodeToggle />
                <ListsToggle />
                <CreateLink />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <InsertImage />
                <InsertAudio />
                <InsertVideo />
                <InsertFile />
                <InsertCodeBlock />
                {/*REF <InsertLayoutBox /> */}
                <InsertGrid />
                <Separator />
                <LessonStyleButton />
                <InsertAnimation />
                <InsertBlockMenu />
              </Stack>
            </Stack>
          )}
          {viewmode !== 'rich-text' && <Box sx={{ minHeight: '32px' }}></Box>}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              width: `calc(100vw - ${leftToolbarPos}px)`,
            }}
          >
            <Stack
              id="save-menu"
              direction="row"
              spacing={1}
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                maxHeight: '32px',
              }}
            >
              <UndoRedo />
              <SaveSlideButton />
            </Stack>
            <Stack
              id="slide-menu"
              direction="row"
              spacing={1}
              sx={{
                backgroundColor: 'background.default',
                borderColor: 'divider',
                borderRadius: '24px',
                borderStyle: 'solid',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <SlideMenu />
            </Stack>
            <Stack
              id="mode-menu"
              direction="row"
              spacing={1}
              sx={{
                //backgroundColor: 'green',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexGrow: 1,
                maxHeight: '32px',
              }}
            >
              <ButtonWithTooltip
                title={t('toolbar.richText', 'Edit Rich Text')}
                onClick={() => {
                  changeViewMode('rich-text');
                }}
                disabled={false}
              >
                {iconComponentFor('rich_text')}
              </ButtonWithTooltip>
              <ButtonWithTooltip
                title="Edit Markdown"
                onClick={() => {
                  changeViewMode('source');
                }}
                disabled={false}
              >
                {iconComponentFor('markdown')}
              </ButtonWithTooltip>
              <ModePreviewButton />
            </Stack>
          </Stack>
        </Stack>

        {viewmode === 'source' && <></>}
      </Box>
    </Box>
  );
};
