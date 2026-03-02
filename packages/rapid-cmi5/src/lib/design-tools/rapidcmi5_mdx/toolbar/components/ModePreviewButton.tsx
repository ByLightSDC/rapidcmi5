import { Box, IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../../styles/styles';
import { ButtonWithTooltip, useCellValue, useRealm } from '@mdxeditor/editor';
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
    <ButtonWithTooltip
      title={isPlayback ? 'Preview ON' : 'Preview OFF'}
      onClick={() => realm.pub(editorInPlayback$, !isPlayback)}
    >
      {isPlayback ? (
        <StopScreenShareIcon color="inherit" />
      ) : (
        <ScreenShareIcon color="inherit" />
      )}
    </ButtonWithTooltip>
  );
};
