import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material';
import { CloudDownload } from '@mui/icons-material';
import { alpha, keyframes, useTheme } from '@mui/system';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { LoadingState } from 'packages/rapid-cmi5/src/lib/redux/repoManagerReducer';
interface CloneLoadingOverlayProps {
  loadingVariant: LoadingState;
}

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const slideInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export function CloneLoadingOverlay({
  loadingVariant,
}: CloneLoadingOverlayProps) {
  if (loadingVariant === LoadingState.loaded) return null;
  const theme = useTheme();
  const { palette } = theme;

  const backgroundGradient = `linear-gradient(
  135deg,
  ${palette.primary.main} 0%,

  ${palette.primary.dark} 100%
)`;

  const glowGradient = `radial-gradient(
  ${palette.primary.main} 0%,
  transparent 55%
)`;
  const message =
    loadingVariant === LoadingState.cloningRepo
      ? 'Cloning repository...'
      : 'Loading Repository...';
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(8px)',
        animation: `${slideInAnimation} 0.3s ease-out`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 4,
          minWidth: '320px',
          maxWidth: '480px',
        }}
      >
        {/* Icon with pulse animation */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer glow ring */}
          <Box
            sx={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: glowGradient,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          />

          {/* Main icon container */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: backgroundGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${alpha(palette.primary.main, 0.2)}`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {loadingVariant === LoadingState.loadingRepo ? (
              <HourglassBottomIcon sx={{ fontSize: 40, color: 'white' }} />
            ) : (
              <CloudDownload sx={{ fontSize: 40, color: 'white' }} />
            )}
          </Box>

          {/* Spinning progress indicator */}
          <CircularProgress
            size={96}
            thickness={2}
            sx={{
              position: 'absolute',
              zIndex: 0,
            }}
          />
        </Box>

        {/* Text content */}
        <Box
          sx={{
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Space Mono", monospace',
              fontWeight: 600,
              mb: 1,
              color: 'white',
            }}
          >
            {message}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              mt: 2,
              display: 'block',
              fontSize: '0.75rem',
              color: 'white',
            }}
          >
            This may take a few moments...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default CloneLoadingOverlay;
