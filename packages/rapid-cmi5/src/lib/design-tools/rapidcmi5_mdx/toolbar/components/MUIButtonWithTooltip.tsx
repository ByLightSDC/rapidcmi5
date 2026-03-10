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
  className,
  disabled,
  testId,
  title,
  onClick,
  sx,
}: ButtonProps & { testId?: string }) => {
  const theme = useTheme();
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton
        className={className}
        data-testid={testId}
        sx={{
          //backgroundColor:'pink',
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
        disabled={disabled}
        size={'small'}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};
