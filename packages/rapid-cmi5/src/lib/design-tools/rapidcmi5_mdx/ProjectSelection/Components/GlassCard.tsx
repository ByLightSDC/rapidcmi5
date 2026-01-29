import { PropsWithChildren, ReactNode } from 'react';
import { Box, Paper, PaperProps, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CreateNewFolder } from '@mui/icons-material';
export interface GlassCardProps extends PaperProps {
  title: string;
  icon: ReactNode;
}
export function GlassCard({
  children,
  title,
  icon,
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
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        borderRadius: 2,
        p: 3,
        animation: 'fadeInUp 0.6s ease-out 0.2s both',

        ...(typeof sx === 'function' ? sx(theme) : sx),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: backgroundGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1,
            boxShadow: boxShadow,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Space Mono", monospace',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}
