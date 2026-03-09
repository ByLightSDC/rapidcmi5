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
}: ButtonProps) => {
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton disabled={disabled} size={'small'} onClick={onClick}>
        {children}
      </IconButton>
    </Tooltip>
  );
};
