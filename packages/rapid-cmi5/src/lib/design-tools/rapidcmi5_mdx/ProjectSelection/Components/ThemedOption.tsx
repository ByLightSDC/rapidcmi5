import { ListItem, Box, useTheme, alpha } from '@mui/material';
import { CustomTheme } from '../../styles/createPalette';

const ThemedOptionCard = ({ children }: { children: React.ReactNode }) => {
  const theme: CustomTheme = useTheme();
  const { palette } = theme;

  return (
    <ListItem disablePadding sx={{ mb: 0.75 }}>
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          borderRadius: 2,
          background: theme.gradients.background,
          border: `1px solid ${alpha(palette.primary.main, 0.22)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: theme.gradients.backgroundHover,
            borderColor: alpha(palette.primary.main, 0.3),
            transform: 'translateY(-2px)',
            boxShadow: alpha(palette.primary.main, 0.3),
          },
        }}
      >
        {children}
      </Box>
    </ListItem>
  );
};

export default ThemedOptionCard;
