import {
  alpha,
  ButtonProps,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';

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
  const theme = useTheme();
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton
        sx={{
          height: '30px',
          ...sx,

          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.light, 0.4), // custom hover color
          },
        }}
        disabled={disabled}
        size={'small'}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};
