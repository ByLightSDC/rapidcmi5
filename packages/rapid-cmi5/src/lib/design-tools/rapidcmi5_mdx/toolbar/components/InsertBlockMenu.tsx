import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { drawerMode$, DRAWER_TYPE, blockShowSeq$ } from './drawers';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * Toolbar button to toggle block library
 */
export const InsertBlockMenu = () => {
  const changeViewMode = usePublisher(drawerMode$);
  const publishShowSeq = usePublisher(blockShowSeq$);
  const showSeq = useCellValue(blockShowSeq$);

  const handleClick = useCallback(() => {
    changeViewMode(DRAWER_TYPE.BLOCK);
    publishShowSeq(showSeq + 1);
  }, [changeViewMode, publishShowSeq, showSeq]);

  return (
    <MUIButtonWithTooltip
      title="Block Library"
      onClick={handleClick}
      aria-label="Toggle Block Library"
    >
      <WidgetsIcon fontSize="medium" />
    </MUIButtonWithTooltip>
  );
};
