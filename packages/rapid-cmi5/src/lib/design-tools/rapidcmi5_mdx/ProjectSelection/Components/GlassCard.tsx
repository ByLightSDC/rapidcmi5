import { ReactNode } from 'react';
import { Box, Paper, PaperProps, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface GlassCardProps extends PaperProps {
  ariaLabelId?: string;
  title: string;
  icon: ReactNode;
  headerAction?: ReactNode;
}
export function GlassCard({
  children,
  ariaLabelId,
  title,
  icon,
  headerAction,
  sx,
  ...props
}: GlassCardProps) {
  const theme = useTheme();
  const { palette } = theme;

  const backgroundGradient = `linear-gradient(
  135deg,
  ${palette.primary.main} 0%,

  ${palette.primary.dark} 100%
)`;
  const boxShadow = `0 8px 20px ${alpha(palette.primary.main, 0)}`;

  return (
    <Paper
      elevation={0}
      {...props}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        background: theme.gradients.backgroundPanel,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        borderRadius: 2,
        p: { xs: 2, sm: 3 },

        ...(typeof sx === 'function' ? sx(theme) : sx),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: backgroundGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: boxShadow,
          }}
        >
          {icon}
        </Box>
        <Typography
          id={ariaLabelId}
          component="h2"
          variant="h6"
          sx={{
            fontFamily: 'inherit',
            lineHeight: 1.4,
            overflowWrap: 'anywhere',
            fontWeight: 600,
            fontSize: '18px',
          }}
        >
          {title}
        </Typography>
        {headerAction && <Box sx={{ ml: 'auto' }}>{headerAction}</Box>}
      </Box>
      {children}
    </Paper>
  );
}
