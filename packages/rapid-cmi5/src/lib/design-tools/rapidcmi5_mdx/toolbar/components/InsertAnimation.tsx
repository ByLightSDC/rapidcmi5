import { useCallback } from 'react';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { animationDrawerOpen$ } from '../../plugins/animation';
import { DRAWER_TYPE, drawerMode$ } from './drawers';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { animationShowSeq$ } from './drawers';
import { useTheme } from '@mui/material';
import {
  getEditorDrawerShortcutAria,
  getEditorDrawerShortcutLabel,
} from './editorDrawerShortcuts';

/**
 * Toolbar button to open animation drawer (always opens, never toggles off)
 */
export const InsertAnimation = () => {
  const publishOpen = usePublisher(animationDrawerOpen$);
  const changeDrawerMode = usePublisher(drawerMode$);
  const publishShowSeq = usePublisher(animationShowSeq$);
  const showSeq = useCellValue(animationShowSeq$);
  const theme = useTheme();
  const shortcutLabel = getEditorDrawerShortcutLabel('animation');

  const handleClick = useCallback(() => {
    changeDrawerMode(DRAWER_TYPE.NONE);
    publishOpen(true);
    publishShowSeq(showSeq + 1);
  }, [changeDrawerMode, publishOpen, publishShowSeq, showSeq]);

  // Accessible name changed because button opens or refocuses, does not toggle
  return (
    <MUIButtonWithTooltip
      title={`Animation Library (${shortcutLabel})`}
      onClick={handleClick}
      aria-label="Open Animation Library"
      aria-keyshortcuts={getEditorDrawerShortcutAria('animation')}
    >
      <MotionPhotosAutoIcon fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
