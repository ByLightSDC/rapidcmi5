import { ButtonProps, IconButton, Tooltip } from '@mui/material';

import { tooltipStyle } from '../../styles/styles';

/**
 * MUI Button
 * @returns
 */
export const MUIButtonWithTooltip = ({
  children,
  title,
  onClick,
  disabled,
  sx,
}: ButtonProps) => {
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton
        sx={{ ...sx, height: '30px' }}
        disabled={disabled}
        size={'small'}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};
