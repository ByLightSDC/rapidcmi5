import {
  alpha,
  ButtonProps,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { tooltipStyle } from '../../styles/styles';

export const MUIToggleSingleGroupWithItem = ({
  children,
  on,
  title,
  onClick,
  disabled,
  sx,
}: ButtonProps & { on: boolean }) => {
  const theme = useTheme();
  return (
    <Tooltip title={title} {...tooltipStyle}>
      <IconButton
        sx={{
          ...sx,
          borderRadius:1,
          backgroundColor: on ? alpha(theme.palette.primary.light, 0.20) : undefined,
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