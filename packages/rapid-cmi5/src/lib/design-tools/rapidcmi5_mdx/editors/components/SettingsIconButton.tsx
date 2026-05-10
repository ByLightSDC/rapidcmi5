import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { tooltipStyle } from '../../styles/styles';

/**
 * Editor Settings
 * @param param0
 * @returns
 */
function SettingsIconButton({ tooltipText, onConfigure }: { tooltipText?: string; onConfigure: () => void }) {
  return (
    <IconButton aria-label="configure" onClick={onConfigure}>
      <Tooltip arrow title={tooltipText}  {...tooltipStyle}>
        <EditIcon />
      </Tooltip>
    </IconButton>
  );
}
export default SettingsIconButton;
