import { IconButton } from '@mui/material';
import { rapidIconFor, RapidIconKey } from '../icons/Icons';

/**
 * Editor Settings
 * @param param0
 * @returns
 */
function SettingsIconButton({ onConfigure }: { onConfigure: () => void }) {
  return (
    <IconButton aria-label="configure" onClick={onConfigure}>
      {rapidIconFor(RapidIconKey.configure)}
    </IconButton>
  );
}
export default SettingsIconButton;
