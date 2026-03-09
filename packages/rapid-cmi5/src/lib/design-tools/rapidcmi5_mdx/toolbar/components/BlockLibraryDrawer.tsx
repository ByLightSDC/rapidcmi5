import { useCallback, useMemo } from 'react';
import {
  Alert,
  alpha,
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE } from './drawers';
import {
  ButtonInfoField,
  ViewExpander,
} from '@rapid-cmi5/ui';

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
  const drawerMode = useCellValue(drawerMode$);
  const changeViewMode = usePublisher(drawerMode$);
  const theme = useTheme();

  const isOpen = useMemo(() => {
    return drawerMode === DRAWER_TYPE.BLOCK;
  }, [drawerMode]);

  const handleClose = useCallback(() => {
    changeViewMode(DRAWER_TYPE.NONE);
  }, [changeViewMode]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      variant="persistent" // Stay open while user clicks elsewhere
      onClose={handleClose}
      sx={{
        position: 'absolute',
        zIndex: 1400, // Higher than MUI modals (1300) and directive editors
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
          zIndex: 1400, // Ensure paper also has high z-index
          overflowY: 'hidden',
        },
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
            <Alert severity="info" sx={{ margin: 2 }}>
              Expand a topic and click item to add it to the current slide.
            </Alert>
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
              defaultIsExpanded={false}
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
