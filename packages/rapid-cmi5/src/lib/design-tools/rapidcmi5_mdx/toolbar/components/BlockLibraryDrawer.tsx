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

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE } from './drawers';
import {
  InsertAccordion,
  InsertGrid,
  InsertSteps,
  InsertTabs,
  themeColor,
  ViewExpander,
} from '@rapid-cmi5/ui';

import { InsertActivities } from './InsertActivities';
import { InsertAdmonitions } from './InsertAdmonitions';

import { InsertTable } from './InsertTable';
import { InsertVideo } from './InsertVideo';
import { InsertAudio } from './InsertAudio';
import { InsertImage } from './InsertImage';
import { InsertCodeBlock } from './InsertCodeBlock';
import { InsertThematicBreak } from './InsertThematicBreak';
import { InsertFile } from './InsertFile';

import WidgetsIcon from '@mui/icons-material/Widgets';

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
        zIndex: 1400,
        // Higher than MUI modals (1300) and directive editors
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
      PaperProps={{
        sx: {
          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
    >
      <Stack
        id="block-library"
        direction="column"
        sx={{ height: '100%', zIndex: 200 }}
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
        <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Alert severity="info" sx={{ margin: 2 }}>
              Expand a topic and click item to add it to the current slide.
            </Alert>
          </Box>
          <ViewExpander
            title="Activities"
            defaultIsExpanded={false}
            headerSxProps={headerSxProps}
          >
            <InsertActivities />
          </ViewExpander>
          <ViewExpander
            title="Admonitions"
            defaultIsExpanded={false}
            headerSxProps={headerSxProps}
          >
            <InsertAdmonitions />
          </ViewExpander>
          <ViewExpander
            title="Layout"
            defaultIsExpanded={false}
            headerSxProps={headerSxProps}
          >
            <Stack direction="column">
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
          >
            <Stack direction="column">
              <InsertAudio isDrawer={true} />
              <InsertCodeBlock isDrawer={true} />
              <InsertFile isDrawer={true} />
              <InsertImage isDrawer={true} />
              <InsertVideo isDrawer={true} />
            </Stack>
          </ViewExpander>
        </Stack>
      </Stack>
    </Drawer>
  );
}
