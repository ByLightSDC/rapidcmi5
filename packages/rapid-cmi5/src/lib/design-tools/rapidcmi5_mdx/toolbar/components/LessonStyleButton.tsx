import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { toggleAnimationDrawer$ } from '../../plugins/animation';
import PaletteIcon from '@mui/icons-material/Palette';
import { DRAWER_TYPE, drawerMode$, stylesShowSeq$ } from './drawers';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * Toolbar button to toggle Lesson Style Drawer
 */
export const LessonStyleButton = () => {
  const changeViewMode = usePublisher(drawerMode$);
  const publishShowSeq = usePublisher(stylesShowSeq$);
  const showSeq = useCellValue(stylesShowSeq$);

  const handleClick = useCallback(() => {
    changeViewMode(DRAWER_TYPE.STYLES);
    publishShowSeq(showSeq + 1);
  }, [changeViewMode, publishShowSeq, showSeq]);

  return (
    <MUIButtonWithTooltip
      title="Lesson Appearance"
      onClick={handleClick}
      aria-label="Lesson Appearance"
    >
      <PaletteIcon fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
