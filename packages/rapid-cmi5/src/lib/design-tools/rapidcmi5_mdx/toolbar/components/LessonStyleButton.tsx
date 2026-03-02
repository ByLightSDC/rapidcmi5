import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { toggleAnimationDrawer$ } from '../../plugins/animation';
import PaletteIcon from '@mui/icons-material/Palette';

/**
 * Toolbar button to toggle Lesson Style Drawer
 */
export const LessonStyleButton = () => {
  
//   const handleClick = useCallback(() => {
//     toggle();
//   }, [toggle]);

  return (
    <ButtonWithTooltip
      title="Style Settings"
      //onClick={handleClick}
      aria-label="Style Settings"
    >
      <PaletteIcon fontSize="medium" />
    </ButtonWithTooltip>
  );
};
