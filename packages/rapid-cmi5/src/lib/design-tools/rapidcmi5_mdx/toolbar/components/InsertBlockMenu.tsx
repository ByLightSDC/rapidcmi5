import { useCallback } from 'react';
import { ButtonWithTooltip } from '@mdxeditor/editor';
import { usePublisher } from '@mdxeditor/gurx';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { drawerMode$, DRAWER_TYPE } from './drawers';

/**
 * Toolbar button to toggle block library
 */
export const InsertBlockMenu = () => {
  const changeViewMode = usePublisher(drawerMode$);

  const handleClick = useCallback(() => {
    changeViewMode(DRAWER_TYPE.BLOCK);
  }, [changeViewMode]);

  return (
    <ButtonWithTooltip
      title="Block Library"
      onClick={handleClick}
      aria-label="Toggle Block Library"
    >
      <WidgetsIcon fontSize="medium" />
    </ButtonWithTooltip>
  );
};
