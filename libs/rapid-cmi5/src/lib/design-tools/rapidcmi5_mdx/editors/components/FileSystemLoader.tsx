import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  LinearProgress,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { fsType } from '../../../../redux/repoManagerReducer';

interface FileSystemLoaderProps {
  isFileSystemLoaded: boolean;
  isGitLoaded: boolean;
  currentFsType: fsType;
}

/**
 * Multi-step loader component that shows file system and git initialization progress
 */
export default function FileSystemLoader({
  isFileSystemLoaded,
  isGitLoaded,
  currentFsType,
}: FileSystemLoaderProps) {
  // Only show loader if either file system or git isn't loaded
  const shouldShowLoader = !isFileSystemLoaded || !isGitLoaded;

  if (!shouldShowLoader) {
    return null;
  }

  const loadingStep = !isFileSystemLoaded ? 1 : 2; // Step 1: FS, Step 2: Git
  const progress = isFileSystemLoaded ? 50 : 0; // 0%, 50%, or 100%

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          padding: 4,
          boxShadow: 24,
          minWidth: 400,
          textAlign: 'center',
        }}
      >
        <Stack spacing={3} alignItems="stretch">
          {/* Main Status */}
          <Typography variant="h6" fontWeight="bold">
            Initializing Repository
          </Typography>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Step {loadingStep} of 2
            </Typography>
          </Box>

          {/* Step 1: File System Loading */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              padding: 2,
              backgroundColor: isFileSystemLoaded
                ? 'success.light'
                : 'action.hover',
              borderRadius: 1,
              opacity: isFileSystemLoaded ? 0.8 : 1,
            }}
          >
            {currentFsType === fsType.localFileSystem ? (
              <FolderOpenIcon
                sx={{
                  fontSize: 32,
                  color: isFileSystemLoaded ? 'success.main' : 'primary.main',
                }}
              />
            ) : (
              <StorageIcon
                sx={{
                  fontSize: 32,
                  color: isFileSystemLoaded ? 'success.main' : 'primary.main',
                }}
              />
            )}

            <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold">
                File System
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentFsType === fsType.localFileSystem
                  ? 'Accessing local file system...'
                  : 'Initializing browser storage...'}
              </Typography>
            </Box>

            {isFileSystemLoaded ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
            ) : (
              <CircularProgress size={24} />
            )}
          </Stack>

          {/* Step 2: Git Initialization */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              padding: 2,
              backgroundColor: isGitLoaded ? 'success.light' : 'action.hover',
              borderRadius: 1,
              opacity: !isFileSystemLoaded ? 0.5 : isGitLoaded ? 0.8 : 1,
            }}
          >
            <AccountTreeIcon
              sx={{
                fontSize: 32,
                color: isGitLoaded
                  ? 'success.main'
                  : isFileSystemLoaded
                    ? 'primary.main'
                    : 'text.disabled',
              }}
            />

            <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={isFileSystemLoaded ? 'text.primary' : 'text.disabled'}
              >
                Git Repository
              </Typography>
              <Typography
                variant="caption"
                color={isFileSystemLoaded ? 'text.secondary' : 'text.disabled'}
              >
                {!isFileSystemLoaded
                  ? 'Waiting for file system...'
                  : 'Loading repository data...'}
              </Typography>
            </Box>

            {isGitLoaded ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
            ) : isFileSystemLoaded ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ width: 24, height: 24 }} /> // Placeholder
            )}
          </Stack>

          {/* Bottom Message */}
          <Box
            sx={{
              backgroundColor: 'warning.main',
              color: 'warning.contrastText',
              padding: 1.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" fontWeight="medium">
              Git operations are temporarily disabled
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
