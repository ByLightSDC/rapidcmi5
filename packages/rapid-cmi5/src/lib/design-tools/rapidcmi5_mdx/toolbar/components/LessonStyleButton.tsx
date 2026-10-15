import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { animationDrawerOpen$ } from '../../plugins/animation';
import PaletteIcon from '@mui/icons-material/Palette';
import { DRAWER_TYPE, drawerMode$, stylesShowSeq$ } from './drawers';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { useTheme } from '@mui/material';
import {
  getEditorDrawerShortcutAria,
  getEditorDrawerShortcutLabel,
} from './editorDrawerShortcuts';

/**
 * Toolbar button to toggle Lesson Style Drawer
 */
export const LessonStyleButton = () => {
  const changeViewMode = usePublisher(drawerMode$);
  const publishAnimationOpen = usePublisher(animationDrawerOpen$);
  const publishShowSeq = usePublisher(stylesShowSeq$);
  const showSeq = useCellValue(stylesShowSeq$);
  // Get the new shortcut
  const shortcutLabel = getEditorDrawerShortcutLabel('appearance');
  const handleClick = useCallback(() => {
    publishAnimationOpen(false);
    changeViewMode(DRAWER_TYPE.STYLES);
    publishShowSeq(showSeq + 1);
  }, [changeViewMode, publishAnimationOpen, publishShowSeq, showSeq]);

  return (
    <MUIButtonWithTooltip
      title={`Course Appearance (${shortcutLabel})`}
      onClick={handleClick}
      aria-label="Course Appearance"
      aria-keyshortcuts={getEditorDrawerShortcutAria('appearance')}
    >
      <PaletteIcon fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
