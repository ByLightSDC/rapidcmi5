import { IconButton, Tooltip } from '@mui/material';
import { rapidIconFor, RapidIconKey } from '../Icons';
import { tooltipStyle } from '../../styles/styles';

/**
 * Editor Delete Button
 * @param param0
 * @returns
 */
function DeleteIconButton({ tooltipText, onDelete }: { tooltipText?: string; onDelete: (payload: any) => void }) {
  return (
    <IconButton
      aria-label="delete"
      onClick={() => {
        onDelete(undefined);
      }}
    > <Tooltip arrow title={tooltipText} {...tooltipStyle}>
        {rapidIconFor(RapidIconKey.delete)}
      </Tooltip>
    </IconButton>
  );
}
export default DeleteIconButton;
