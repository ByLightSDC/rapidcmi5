
import { Box, IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../../styles/styles';
import { useCellValue, useRealm } from '@mdxeditor/editor';
import { editorInPlayback$, iconColor } from '@rapid-cmi5/ui';

/** Icons */
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

/**
 * Preview Mode Button
 * so instructor can see what student sees without launching the cmi5 player
 * @returns 
 */
export const ModePreviewButton = () => {
  const themeIconColor = useSelector(iconColor);
  const realm = useRealm();
  const isPlayback = useCellValue(editorInPlayback$);

  return (
    <IconButton
      aria-label="toggle-playback"
      size={iconButtonSize}
      style={iconButtonStyle}
      onClick={() => realm.pub(editorInPlayback$, !isPlayback)}
    >
      <Box
        sx={{
          color: themeIconColor,
          display: 'flex',
        }}
      >
        {isPlayback ? (
          <Tooltip title="Toggle Preview OFF" {...tooltipStyle}>
            <StopScreenShareIcon color="inherit" />
          </Tooltip>
        ) : (
          <Tooltip title="Toggle Preview ON" {...tooltipStyle}>
            <ScreenShareIcon color="inherit" />
          </Tooltip>
        )}
      </Box>
    </IconButton>
  );
};
