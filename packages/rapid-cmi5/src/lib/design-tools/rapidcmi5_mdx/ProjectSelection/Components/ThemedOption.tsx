import { ListItem, Box, useTheme, alpha } from '@mui/material';

const ThemedOptionCard = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const { palette } = theme;

  return (
    <ListItem disablePadding sx={{ mb: 0.75 }}>
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          borderRadius: 2,
          background: alpha(palette.primary.main, 0.15),
          border: `1px solid ${alpha(palette.primary.main, 0.22)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: alpha(palette.primary.main, 0.17),
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
