import { Paper, Typography, Button } from '@mui/material';
import { alpha, Box, useTheme } from '@mui/system';
import {
  Science as SandboxIcon,
  ArrowForward,
  Info,
} from '@mui/icons-material';
import { GlassCard } from './GlassCard';

export default function SandBoxSelection({
  openSandbox,
  isLaunching = false,
}: {
  openSandbox: () => void;
  isLaunching?: boolean;
}) {
  const theme = useTheme();
  const { palette } = theme;
  return (
    <GlassCard
      title="Sandbox Mode"
      icon={<SandboxIcon sx={{ color: 'white' }} />}
    >
      <Typography
        variant="body1"
        sx={{
          mb: 1,
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: '14px',
        }}
      >
        Try out RapidCMI5 in a safe testing environment. Perfect for learning
        and experimentation without affecting your projects.
      </Typography>

      <Button
        variant="contained"
        size="large"
        fullWidth
        endIcon={!isLaunching ? <ArrowForward sx={{ mt: 0.5 }} /> : undefined}
        sx={{
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${alpha(palette.primary.main, 0.9)} 100%)`,
          fontFamily: '"Space Mono", monospace',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          borderRadius: 2,
          boxShadow: `0 8px 20px ${alpha(palette.primary.main, 0.01)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${alpha(palette.primary.main, 0.9)} 50%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 12px 28px ${alpha(palette.primary.main, 0.05)}`,
          },
        }}
        onClick={openSandbox}
        disabled={isLaunching}
      >
        {isLaunching ? 'Launching Sandbox...' : 'Launch Sandbox'}
      </Button>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          background: alpha(palette.primary.main, 0.05),
          border: `1px solid ${alpha(palette.primary.main, 0.15)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Info
            sx={{
              color: alpha(palette.primary.main, 0.8),
              fontSize: 20,
              mt: 0.2,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontFamily: '"IBM Plex Sans", sans-serif',
            }}
          >
            Sandbox content is stored in browser memory only and will not be
            persisted long-term. Your work will be lost when you close the
            session.
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}
