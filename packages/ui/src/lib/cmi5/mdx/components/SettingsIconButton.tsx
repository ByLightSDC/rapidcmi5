import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

/**
 * Editor Settings
 * @param param0
 * @returns
 */
function SettingsIconButton({ onConfigure }: { onConfigure: () => void }) {
  return (
    <IconButton aria-label="configure" onClick={onConfigure}>
     <EditIcon />
    </IconButton>
  );
}
export default SettingsIconButton;
