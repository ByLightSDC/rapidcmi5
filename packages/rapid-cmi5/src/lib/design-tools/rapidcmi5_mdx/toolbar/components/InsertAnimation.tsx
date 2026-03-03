import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { toggleAnimationDrawer$ } from '../../plugins/animation';

/**
 * Toolbar button to toggle animation drawer
 */
export const InsertAnimation = () => {
  const toggle = usePublisher(toggleAnimationDrawer$);

  const handleClick = useCallback(() => {
    toggle();
  }, [toggle]);

  return (
    <ButtonWithTooltip
      title="Animation Library"
      onClick={handleClick}
      aria-label="Toggle Animation Library"
    >
      <MotionPhotosAutoIcon fontSize="medium" />
    </ButtonWithTooltip>
  );
};
