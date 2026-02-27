import React, { useCallback, useEffect, useMemo } from 'react';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE } from './drawers';

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
        zIndex: 1400, // Higher than MUI modals (1300) and directive editors
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',

          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
    >
      <Stack direction="column" sx={{ height: '100%' }}>
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
          <IconButton onClick={handleClose} aria-label="Close animation drawer">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, marginLeft: 1 }}>
            Block Library
          </Typography>
        </Stack>
      </Stack>
    </Drawer>
  );
}
