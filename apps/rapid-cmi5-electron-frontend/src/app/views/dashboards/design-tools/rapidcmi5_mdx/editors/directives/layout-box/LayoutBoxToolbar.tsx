import { readOnly$ } from '@mdxeditor/editor';
import { useCellValues } from '@mdxeditor/gurx';
import { tooltipStyle } from '../../../styles/styles';
import RightMenuContainer from '../../components/RightMenuContainer';

// MUI
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import SettingsIconButton from '../../components/SettingsIconButton';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

interface AlignmentToolbarProps {
  handleJustificationChange: (justification: string) => void;
  handleAlignmentChange: (alignment: string) => void;
  handleClearLayout: () => void;
  onOpenStyleDialog?: () => void;
}

/**
 * Displays buttons for choosing an alignment of:
 *  - Left (flex-start)
 *  - Center (center)
 *  - Right (flex-end)
 *
 * @constructor
 */
export function LayoutBoxToolbar({
  handleJustificationChange,
  handleAlignmentChange,
  handleClearLayout,
  onOpenStyleDialog,
}: AlignmentToolbarProps): JSX.Element {
  const [readOnly] = useCellValues(readOnly$);

  return (
    <RightMenuContainer
      sxProps={{
        zIndex: 9999,
        top: -29,
        position: 'absolute',
      }}
    >
      <IconButton
        aria-label="left"
        disabled={readOnly}
        onClick={(e) => {
          handleJustificationChange('flex-start');
        }}
      >
        <Tooltip arrow title={`Align Left`} {...tooltipStyle}>
          <VerticalAlignBottomIcon
            fontSize="small"
            sx={{ transform: 'rotate(90deg)' }}
          />
        </Tooltip>
      </IconButton>

      <IconButton
        aria-label="center"
        disabled={readOnly}
        onClick={(e) => {
          handleJustificationChange('center');
        }}
      >
        <Tooltip arrow title={`Align Center`} {...tooltipStyle}>
          <VerticalAlignCenterIcon
            fontSize="small"
            sx={{ transform: 'rotate(90deg)' }}
          />
        </Tooltip>
      </IconButton>

      <IconButton
        aria-label="right"
        disabled={readOnly}
        onClick={(e) => {
          handleJustificationChange('flex-end');
        }}
      >
        <Tooltip arrow title={`Align Right`} {...tooltipStyle}>
          <VerticalAlignTopIcon
            fontSize="small"
            sx={{ transform: 'rotate(90deg)' }}
          />
        </Tooltip>
      </IconButton>

      {/* <IconButton
        aria-label="styles"
        disabled={readOnly}
        onClick={() => onOpenStyleDialog?.()}
      >
        <Tooltip arrow title={`Edit Styles`} {...tooltipStyle}>
          <SettingsIcon fontSize='small' />
        </Tooltip>
      </IconButton> */}
      <SettingsIconButton onConfigure={() => onOpenStyleDialog?.()} />

      <IconButton
        aria-label="clear"
        disabled={readOnly}
        onClick={(e) => {
          handleClearLayout();
        }}
      >
        <Tooltip arrow title={`Clear Layout Box`} {...tooltipStyle}>
          <NotInterestedIcon fontSize="small" />
        </Tooltip>
      </IconButton>
    </RightMenuContainer>
  );
}
