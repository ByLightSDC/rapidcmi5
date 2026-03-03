import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { toggleAnimationDrawer$ } from '../../plugins/animation';
import PaletteIcon from '@mui/icons-material/Palette';
import { DRAWER_TYPE, drawerMode$ } from './drawers';

/**
 * Toolbar button to toggle Lesson Style Drawer
 */
export const LessonStyleButton = () => {
  const changeViewMode = usePublisher(drawerMode$);

  const handleClick = useCallback(() => {
    changeViewMode(DRAWER_TYPE.STYLES);
  }, [changeViewMode]);

  return (
    <ButtonWithTooltip
      title="Lesson Appearance"
      onClick={handleClick}
      aria-label="Lesson Appearance"
    >
      <PaletteIcon fontSize="medium" />
    </ButtonWithTooltip>
  );
};
