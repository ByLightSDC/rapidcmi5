import { IconButton, Tooltip } from '@mui/material';
import { rapidIconFor, RapidIconKey } from '../icons/Icons';

/**
 * Editor Delete Button
 * @param param0
 * @returns
 */
function DeleteIconButton({ onDelete }: { onDelete: (payload: any) => void }) {
  return (
    <Tooltip title="Delete">
      <IconButton
        size="small"
        aria-label="delete"
        onClick={() => {
          onDelete(undefined);
        }}
      >
        {rapidIconFor(RapidIconKey.delete)}
      </IconButton>
    </Tooltip>
  );
}
export default DeleteIconButton;
