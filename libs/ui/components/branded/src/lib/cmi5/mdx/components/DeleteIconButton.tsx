import { IconButton } from '@mui/material';
import { rapidIconFor, RapidIconKey } from '../icons/Icons';

/**
 * Editor Delete Button
 * @param param0
 * @returns
 */
function DeleteIconButton({ onDelete }: { onDelete: (payload: any) => void }) {
  return (
    <IconButton
      aria-label="delete"
      onClick={() => {
        onDelete(undefined);
      }}
    >
      {rapidIconFor(RapidIconKey.delete)}
    </IconButton>
  );
}
export default DeleteIconButton;
