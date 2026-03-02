import  { useCallback, useMemo } from 'react';
import {
  Drawer,
  IconButton,
  Stack,
  Typography,
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
import { useSelector } from 'react-redux';

import { InsertTable } from './InsertTable';
import { InsertVideo } from './InsertVideo';
import { InsertAudio } from './InsertAudio';
import { InsertImage } from './InsertImage';
import { InsertCodeBlock } from './InsertCodeBlock';
import { InsertThematicBreak } from './InsertThematicBreak';

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
        id="mico"
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
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton onClick={handleClose} aria-label="Close Block Library">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, marginLeft: 1 }}>
            Block Library
          </Typography>
        </Stack>
        <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
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
            title="Layouts"
            defaultIsExpanded={false}
            headerSxProps={headerSxProps}
          >
            <Stack direction="column">
              <InsertSteps isDrawer={true} />
              <InsertTable isDrawer={true} />
              <InsertTabs isDrawer={true} />
              <InsertAccordion isDrawer={true} />
              <InsertGrid isDrawer={true} />
              <InsertThematicBreak isDrawer={true}/> 
            </Stack>
          </ViewExpander>
          <ViewExpander
            title="Media"
            defaultIsExpanded={false}
            headerSxProps={headerSxProps}
          >
            <Stack direction="column">
              <InsertImage isDrawer={true} />
              <InsertVideo isDrawer={true} />
              <InsertAudio isDrawer={true} />
              <InsertCodeBlock isDrawer={true} />
            </Stack>
          </ViewExpander>
        </Stack>
      </Stack>
    </Drawer>
  );
}
