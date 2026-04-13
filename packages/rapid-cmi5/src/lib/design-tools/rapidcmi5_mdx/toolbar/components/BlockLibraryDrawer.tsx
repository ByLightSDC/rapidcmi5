import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import { useDrawerAutoHide } from './useDrawerAutoHide';

import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { useCellValue, useCellValues, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE, blockShowSeq$ } from './drawers';
import { ButtonInfoField, ViewExpander } from '@rapid-cmi5/ui';

import { InsertActivities } from './InsertActivities';
import { InsertAdmonitions } from './InsertAdmonitions';

import { InsertAccordion } from './InsertAccordion';
import { InsertGrid } from './InsertGrid';
import { InsertTable } from './InsertTable';
import { InsertVideo } from './InsertVideo';
import { InsertAudio } from './InsertAudio';
import { InsertImage } from './InsertImage';
import { InsertCodeBlock } from './InsertCodeBlock';
import { InsertThematicBreak } from './InsertThematicBreak';
import { InsertFile } from './InsertFile';
import { InsertSteps } from './InsertSteps';
import { InsertTabs } from './InsertTabs';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { activitiesTable } from '../../constants/toolbar';
import { InsertQuotes } from './InsertQuotes';
import { activeEditor$ } from '@mdxeditor/editor';
import { mergeRegister } from '@lexical/utils';
import {
  insertNoCursorMessage,
  insertNoSelectionMessage,
  insertSelectionInstructions,
  selectionRangeError,
} from '../constants';

const headerSxProps = {
  cursor: 'pointer',
  marginTop: 2,
};

/**
 * Blocks Library
 * Insert menu for admonitions, activities, and special block objects
 */
export function BlockLibraryDrawer() {
  useLexicalComposerContext(); // Ensures we are inside a Lexical editor context
  const [activeEditor] = useCellValues(activeEditor$);
  const showSeq = useCellValue(blockShowSeq$);
  const drawerMode = useCellValue(drawerMode$);
  const changeViewMode = usePublisher(drawerMode$);
  const [isInsertAllowed, setIsInsertAllowed] = useState<boolean>(false);
  const [insertMessage, setInsertMessage] = useState<string | null>(
    insertNoCursorMessage,
  );

  const theme = useTheme();

  const isOpen = useMemo(() => {
    return drawerMode === DRAWER_TYPE.BLOCK;
  }, [drawerMode]);

  const handleClose = useCallback(() => {
    changeViewMode(DRAWER_TYPE.NONE);
  }, [changeViewMode]);

  const {
    autoHide,
    toggleAutoHide,
    handleMouseEnter,
    handleMouseLeave,
    effectiveOpen,
    getDrawerSx,
  } = useDrawerAutoHide('block', isOpen, showSeq);

  /**
   * Listen for selection changes to determine if block insertion is allowed and to set appropriate messages.
   */
  useEffect(() => {
    if (!activeEditor) {
      return;
    }

    const unregister = mergeRegister(
      activeEditor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if (selection === null) {
            setInsertMessage(insertNoCursorMessage);
          }
          if (!$isRangeSelection(selection)) {
            setInsertMessage(selectionRangeError);
            setIsInsertAllowed(false);
            return false;
          }
          if (selection.isCollapsed()) {
            setIsInsertAllowed(true);
            setInsertMessage(null);
            return true;
          } else {
            setIsInsertAllowed(false);
            setInsertMessage(insertNoSelectionMessage);
            return false; //no applying quote to selection
          }
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return () => {
      unregister();
    };
  }, [activeEditor]);

  return (
    <Drawer
      anchor="right"
      open={effectiveOpen}
      variant="persistent" // Stay open while user clicks elsewhere
      onClose={handleClose}
      sx={getDrawerSx({
        position: 'absolute',
        zIndex: 1400, // Higher than MUI modals (1300) and directive editors
        pointerEvents: 'none', // Root div never captures clicks; Paper has its own pointer events
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
          zIndex: 1400,
          overflowY: 'hidden',
          pointerEvents: 'auto',
        },
      })}
      PaperProps={{
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }}
    >
      <Stack
        id="block-library"
        direction="column"
        sx={{ height: '100%' }}
        spacing={0}
      >
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            padding: 2,
            background: alpha(theme.palette.primary.main, 0.15),
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <WidgetsIcon color="primary" />
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', flex: 1, marginLeft: 1 }}
          >
            Block Library
          </Typography>
          <Tooltip
            title={
              autoHide
                ? 'Auto-hide on (click to pin)'
                : 'Auto-hide off (click to enable)'
            }
          >
            <IconButton
              onClick={toggleAutoHide}
              aria-label={autoHide ? 'Disable auto-hide' : 'Enable auto-hide'}
              size="small"
              sx={{ color: autoHide ? 'primary.main' : 'text.disabled' }}
            >
              {autoHide ? (
                <PushPinOutlinedIcon fontSize="small" />
              ) : (
                <PushPinIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} aria-label="Close Block Library">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Stack
          direction="column"
          sx={{
            mt: 1,
            height: '100%',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Box>
            {!isInsertAllowed ? (
              <Alert severity="warning" sx={{ margin: 2 }}>
                {insertMessage}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ margin: 2 }}>
                {insertSelectionInstructions}
              </Alert>
            )}
          </Box>
          <Stack direction="column" spacing={2}>
            <ViewExpander
              title="Activities"
              defaultIsExpanded={false}
              headerSxProps={headerSxProps}
              rightMenuChildren={
                <ButtonInfoField
                  alertSxProps={{
                    maxWidth: '640px',
                  }}
                  popperPlacement="auto-end"
                  message={
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                    >
                      {activitiesTable}
                    </Markdown>
                  }
                  triggerOnClick={true}
                />
              }
              shouldStartWithDivider={true}
              shouldEndWithDivider={true}
            >
              <Box sx={{ paddingLeft: 1, paddingRight: 1 }}>
                <InsertActivities />
              </Box>
            </ViewExpander>
            <ViewExpander
              title="Admonitions"
              defaultIsExpanded={false}
              headerSxProps={headerSxProps}
              shouldEndWithDivider={true}
            >
              <Box sx={{ paddingLeft: 1, paddingRight: 1 }}>
                <InsertAdmonitions />
              </Box>
            </ViewExpander>
            <ViewExpander
              title="Layout"
              defaultIsExpanded={true}
              headerSxProps={headerSxProps}
              shouldEndWithDivider={true}
            >
              <Stack
                direction="column"
                sx={{
                  paddingLeft: 1,
                  paddingRight: 1,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignContent: 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                <InsertAccordion isDrawer={true} />
                <InsertGrid isDrawer={true} />
                <InsertSteps isDrawer={true} />
                <InsertQuotes isDrawer={true} />
                <InsertTable isDrawer={true} />
                <InsertTabs isDrawer={true} />
                <InsertThematicBreak isDrawer={true} />
              </Stack>
            </ViewExpander>
            <ViewExpander
              title="Media"
              defaultIsExpanded={false}
              headerSxProps={headerSxProps}
              shouldEndWithDivider={true}
            >
              <Stack
                direction="column"
                sx={{ paddingLeft: 1, paddingRight: 1 }}
              >
                <InsertAudio isDrawer={true} />
                <InsertCodeBlock isDrawer={true} />
                <InsertFile isDrawer={true} />
                <InsertImage isDrawer={true} />
                <InsertVideo isDrawer={true} />
              </Stack>
            </ViewExpander>
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}
