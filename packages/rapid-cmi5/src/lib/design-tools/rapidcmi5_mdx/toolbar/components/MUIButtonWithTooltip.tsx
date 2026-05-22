import {
  alpha,
  ButtonProps,
  IconButton,
  SxProps,
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
  className,
  disabled,
  testId,
  'data-testid': dataTestId,
  title,
  onClick,
  sx,
  styles,
}: ButtonProps & {
  styles?: any;
  testId?: string;
  'data-testid'?: string;
}) => {
  const theme = useTheme();
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton
        className={className}
        data-testid={testId ?? dataTestId}
        sx={{
          height: '30px',
          ...sx,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.light, 0.4), // custom hover color
          },
          /* disabled button styles */
          '&.Mui-disabled': {
            //backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },

          /* ensure the icon itself matches disabled color */
          '&.Mui-disabled svg': {
            fill: theme.palette.action.disabled,
          },
        }}
        style={{
          ...styles,
          '&.disabled': {
            color: theme.palette.action.disabled,
          },

          /* ensure the icon itself matches disabled color */
          '&.disabled svg': {
            fill: theme.palette.action.disabled,
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
