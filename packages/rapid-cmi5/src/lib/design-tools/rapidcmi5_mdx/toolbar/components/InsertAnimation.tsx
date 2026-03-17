import { useCallback } from 'react';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import MotionPhotosAutoIcon from '@mui/icons-material/MotionPhotosAuto';
import { animationDrawerOpen$ } from '../../plugins/animation';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { animationShowSeq$ } from './drawers';

/**
 * Toolbar button to open animation drawer (always opens, never toggles off)
 */
export const InsertAnimation = () => {
  const publishOpen = usePublisher(animationDrawerOpen$);
  const publishShowSeq = usePublisher(animationShowSeq$);
  const showSeq = useCellValue(animationShowSeq$);

  const handleClick = useCallback(() => {
    publishOpen(true);
    publishShowSeq(showSeq + 1);
  }, [publishOpen, publishShowSeq, showSeq]);

  return (
    <MUIButtonWithTooltip
      title="Animation Library"
      onClick={handleClick}
      aria-label="Toggle Animation Library"
    >
      <MotionPhotosAutoIcon fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
