import { Typography, useTheme } from '@mui/material';
import { Box, alpha } from '@mui/system';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export function NoScenarioCard() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        my: 1,
        p: 1,
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <FolderOpenIcon
        sx={{
          fontSize: 20,
          color: alpha(theme.palette.text.secondary, 0.7),
          flexShrink: 0,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: alpha(theme.palette.text.secondary, 0.7),
        }}
      >
        No scenario selected
      </Typography>
    </Box>
  );
}
