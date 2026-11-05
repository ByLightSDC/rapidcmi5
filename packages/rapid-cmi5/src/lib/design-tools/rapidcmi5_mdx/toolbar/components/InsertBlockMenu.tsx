import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { animationDrawerOpen$ } from '../../plugins/animation';
import { drawerMode$, DRAWER_TYPE, blockShowSeq$ } from './drawers';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { useTheme } from '@mui/material';
import {
  getEditorDrawerShortcutAria,
  getEditorDrawerShortcutLabel,
} from './editorDrawerShortcuts';

/**
 * Toolbar button to toggle block library
 */
export const InsertBlockMenu = () => {
  const changeViewMode = usePublisher(drawerMode$);
  const publishAnimationOpen = usePublisher(animationDrawerOpen$);
  const publishShowSeq = usePublisher(blockShowSeq$);
  const showSeq = useCellValue(blockShowSeq$);
  const theme = useTheme();
  // Get the new shortcut
  const shortcutLabel = getEditorDrawerShortcutLabel('blocks');

  const handleClick = useCallback(() => {
    // Animation uses its own animationDrawerOpen$ state. Styles and Blocks use drawerMode$, ensure animation is closed.
    publishAnimationOpen(false);
    changeViewMode(DRAWER_TYPE.BLOCK);
    publishShowSeq(showSeq + 1);
  }, [changeViewMode, publishAnimationOpen, publishShowSeq, showSeq]);

  return (
    // Accessible name changed because button opens or refocuses, does not toggle
    <MUIButtonWithTooltip
      title={`Block Library (${shortcutLabel})`}
      onClick={handleClick}
      aria-label="Open Block Library"
      aria-keyshortcuts={getEditorDrawerShortcutAria('blocks')}
      style={{ color: theme.palette.primary.main }}
    >
      <WidgetsIcon style={{ color: 'inherit' }} fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
