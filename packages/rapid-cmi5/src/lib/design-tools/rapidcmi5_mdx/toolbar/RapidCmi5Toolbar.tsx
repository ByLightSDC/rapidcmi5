import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  StrikeThroughSupSubToggles,
  Separator,
  usePublisher,
  viewMode$,
  useCellValue,
  useRealm,
  iconComponentFor$,
  useCellValues,
  useTranslation,
} from '@mdxeditor/editor';
import { CLEAR_HISTORY_COMMAND } from 'lexical';

/** Icons */
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import { MarkdownIconSvg } from './constants';

import { alpha, Box, Divider, Stack, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RC5Context } from '../contexts/RC5Context';

import {
  editorInPlayback$,
  CONTENT_UPDATED_COMMAND,
  dividerColor,
  toolbarRect$,
} from '@rapid-cmi5/ui';

import { displayData } from '../../../redux/courseBuilderReducer';
import { SlideMenu } from '../menu/SlideMenu';
import { SaveSlideButton } from './components/SaveSlideButton';
import { LessonStyleButton } from './components/LessonStyleButton';
import { BlockTypeSelect } from './components/BlockTypeSelect';

import { InsertAccordion } from './components/InsertAccordion';
import { InsertAudio } from './components/InsertAudio';
import { InsertAnimation } from './components/InsertAnimation';
import { InsertBlockMenu } from './components/InsertBlockMenu';
import { InsertCodeBlock } from './components/InsertCodeBlock';
import { InsertFile } from './components/InsertFile';
import { InsertGrid } from './components/InsertGrid';
import { InsertImage } from './components/InsertImage';
import { InsertSteps } from './components/InsertSteps';
import { InsertTabs } from './components/InsertTabs';
import { InsertVideo } from './components/InsertVideo';
//REF import { InsertLayoutBox } from './components/InsertLayoutBox';
import { InsertLayoutBox } from './components/InsertLayoutBox';
import { InsertLink } from './components/InsertLink';
import { InsertThematicBreak } from './components/InsertThematicBreak';
import { InsertTable } from './components/InsertTable';
import { ColorTextSplitButton } from './components/ColorTextSplitButton';
import { HighlightSplitButton } from './components/HighlightSplitButton';
import { TextFxButton } from './components/TextFxButton';

import { MUIButtonWithTooltip } from './components/MUIButtonWithTooltip';
import { BoldItalicUnderlineToggles } from './components/BoldItalicUnderlineToggles';
import { ListsToggle } from './components/ListsToggle';
import { UndoRedo } from './components/UndoRedo';

/**
 * Layout Constants
 *
 */
const leftToolWidthContainer = 582; 
const rightToolWidthContainer = 131;
const toolIconWidth = 32.0;
const rightToolbarMargin = 24;
const moreTextToolWidth = 100;

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

  const [minExtraToolsWidth, setMinExtraToolsWidth] = useState(0);
  const [maxExtraToolsWidth, setMaxExtraToolsWidth] = useState(0);

  const [isMoreTextTools, setIsMoreTextTools] = useState(false);

  const isPlayback = useCellValue(editorInPlayback$);
  const [viewMode] = useCellValues(viewMode$);
  const t = useTranslation();
  const theme = useTheme();

  const disabledIconColor = alpha((theme as any).palette.divider, 0.25);
  const activeIconColor = theme.palette.text.primary; //REFtheme.palette.primary.main;

  /**
   * themed icon
   */
  const markDownIcon = useMemo(() => {
    if (viewMode == 'source') {
      return MarkdownIconSvg(disabledIconColor);
    }
    return MarkdownIconSvg(activeIconColor);
  }, [viewMode, disabledIconColor, activeIconColor]);

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

        //store for other components
        toolbarRect$.value = rect;

        // Calculate the absolute position relative to the document
        const left = rect.left + window.scrollX;

        // calculate extra width where additional tools can be injected
        const extraWidth =
          window.innerWidth -
          (left + leftToolWidthContainer + rightToolWidthContainer);

        // avoid partial display
        setMinExtraToolsWidth(
          Math.floor((extraWidth - moreTextToolWidth) / toolIconWidth) *
            toolIconWidth,
        );
        setMaxExtraToolsWidth(
          Math.floor(extraWidth / toolIconWidth) * toolIconWidth,
        );

        //tool bar left plus 24 px right margin
        setLeftToolbarPos(left + rightToolbarMargin);

        //set width in css so we can tell activities to ignore content width settings
        document.documentElement.style.setProperty('--panel-width', `${rect.left}px`);
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(toolbarRef.current);

    return () => observer.disconnect();

    // Ensure the ref is attached to a DOM element and that element exists
  }, []);

  const currentExtraToolWidth = isMoreTextTools
    ? minExtraToolsWidth
    : maxExtraToolsWidth;

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
        zIndex: 1500, // Above drawer roots (1400) so toolbar buttons are never blocked
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
              <Stack direction="row" spacing={0} sx={{ flexGrow: 1 }}>
                <BoldItalicUnderlineToggles />
                <ColorTextSplitButton />
                <HighlightSplitButton />
                <TextFxButton />
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
                  <MUIButtonWithTooltip
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
                  </MUIButtonWithTooltip>
                  {isMoreTextTools && (
                    <Box sx={{ marginLeft: -1 }}>
                      <StrikeThroughSupSubToggles />
                    </Box>
                  )}
                </Stack>
                <Separator />
                <ListsToggle />
                <InsertLink />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                {currentExtraToolWidth > 0 && (
                  <Stack
                    direction="row"
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        width: `${currentExtraToolWidth}px`,
                        flexWrap: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <InsertImage />
                      <InsertVideo />
                      <InsertAudio />
                      <InsertFile />
                      <InsertCodeBlock />
                      <InsertGrid />
                      <InsertLayoutBox />
                      <InsertAccordion />
                      <InsertSteps />
                      <InsertTable />
                      <InsertTabs />
                      <InsertThematicBreak />
                    </Stack>
                  </Stack>
                )}
                <Stack
                  direction="row"
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Separator />
                  <LessonStyleButton />
                  <InsertAnimation />
                  <InsertBlockMenu />
                </Stack>
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
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexGrow: 1,
                maxHeight: '32px',
              }}
            >
              <MUIButtonWithTooltip
                title={isPlayback ? 'Preview OFF' : 'Preview ON'}
                onClick={() => {
                  changeViewMode('rich-text');
                  realm.pub(editorInPlayback$, !isPlayback);
                  realm.pub(editorInPlayback$, !isPlayback);
                }}
                disabled={viewMode === 'source'}
              >
                {isPlayback ? (
                  <StopScreenShareIcon
                    sx={{
                      color:
                        viewmode === 'source'
                          ? disabledIconColor
                          : activeIconColor,
                      fill:
                        viewmode === 'source'
                          ? disabledIconColor
                          : activeIconColor,
                    }}
                  />
                ) : (
                  <ScreenShareIcon
                    sx={{
                      color:
                        viewmode === 'source'
                          ? disabledIconColor
                          : activeIconColor,
                      fill:
                        viewmode === 'source'
                          ? disabledIconColor
                          : activeIconColor,
                    }}
                  />
                )}
              </MUIButtonWithTooltip>
              <Stack
                direction="row"
                sx={{
                  borderRadius: 4,
                  paddingLeft: 0.5,
                  paddingRight: 0.5,
                  height: '32px',
                  border: `1px solid ${disabledIconColor}`,
                  transition:
                    'transform 120ms ease, background-color 120ms ease',
                }}
              >
                <MUIButtonWithTooltip
                  title={t('toolbar.richText', 'Edit Rich Text')}
                  onClick={() => {
                    changeViewMode('rich-text');
                  }}
                  disabled={viewMode === 'rich-text'}
                >
                  <ArtTrackIcon
                    sx={{
                      fontSize: '32px',
                      color:
                        viewmode === 'rich-text'
                          ? disabledIconColor
                          : activeIconColor,
                      fill:
                        viewmode === 'rich-text'
                          ? disabledIconColor
                          : activeIconColor,
                    }}
                  />
                </MUIButtonWithTooltip>
                <Divider
                  orientation="vertical"
                  color="divider"
                  flexItem
                  sx={{ mx: 0 }}
                />
                <MUIButtonWithTooltip
                  title="Edit Markdown"
                  onClick={() => {
                    changeViewMode('source');
                  }}
                  disabled={viewMode === 'source'}
                >
                  {markDownIcon}
                </MUIButtonWithTooltip>
              </Stack>

              {/* <Stack
                direction="row"
                sx={{
                  borderRadius: 4,
                  paddingLeft: 0.5,
                  paddingRight: 0.5,
                  height: '32px',
                  border: `1px solid ${disabledIconColor}`,
                  transition:
                    'transform 120ms ease, background-color 120ms ease',
                }}
              >
                <MUIButtonWithTooltip
                  title={t('toolbar.richText', 'Edit Rich Text')}
                  onClick={() => {
                    changeViewMode('rich-text');
                  }}
                  disabled={viewMode === 'rich-text'}
                >
                  <ArtTrackIcon
                    sx={{
                      fontSize: '32px',
                      color:
                        viewmode === 'rich-text'
                          ? disabledIconColor
                          : activeIconColor,
                      fill:
                        viewmode === 'rich-text'
                          ? disabledIconColor
                          : activeIconColor,
                    }}
                  />
                </MUIButtonWithTooltip>
                <Divider
                  orientation="vertical"
                  color="divider"
                  flexItem
                  sx={{ mx: 0 }}
                />
                <MUIButtonWithTooltip
                  title="Edit Markdown"
                  onClick={() => {
                    changeViewMode('source');
                  }}
                  disabled={viewMode === 'source'}
                >
                  {markDownIcon}
                </MUIButtonWithTooltip>
              </Stack> */}
            </Stack>
          </Stack>
        </Stack>

        {viewmode === 'source' && <></>}
      </Box>
    </Box>
  );
};
