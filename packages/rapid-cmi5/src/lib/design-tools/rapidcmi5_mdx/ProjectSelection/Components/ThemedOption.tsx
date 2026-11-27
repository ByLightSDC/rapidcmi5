import { ListItem, Box, useTheme, alpha } from '@mui/material';
import { CustomTheme } from '../../styles/createPalette';

const ThemedOptionCard = ({ children }: { children: React.ReactNode }) => {
  const theme: CustomTheme = useTheme();
  const { palette } = theme;

  return (
    <ListItem component="div" disablePadding sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          position: 'relative',
          borderRadius: 2,
          background: theme.gradients.background,
          border: `1px solid ${alpha(palette.primary.main, 0.22)}`,
          transition: 'background-color 150ms ease, border-color 150ms ease',
          '&:focus-within': {
            outline: `2px solid ${palette.primary.main}`,
            outlineOffset: 2,
          },
          '&:hover': {
            background: theme.gradients.backgroundHover,
            borderColor: alpha(palette.primary.main, 0.3),
          },
        }}
      >
        {children}
      </Box>
    </ListItem>
  );
};

export default ThemedOptionCard;
