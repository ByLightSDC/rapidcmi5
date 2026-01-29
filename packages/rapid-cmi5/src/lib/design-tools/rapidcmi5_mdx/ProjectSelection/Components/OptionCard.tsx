import { Info, InfoOutlined } from '@mui/icons-material';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import ThemedOptionCard from './ThemedOption';

const OptionCard = ({
  title,
  handleSelect,
  handleShowDocs,
  subText,
  icon,
  'data-testid': dataTestId, // Accept data-testid prop
}: {
  title: string;
  handleSelect: () => void;
  handleShowDocs: () => void;
  subText: JSX.Element;
  icon: JSX.Element;
  'data-testid'?: string; // Add to type definition
}) => {
  const theme = useTheme();
  const { palette } = theme;

  return (
    <ThemedOptionCard>
      {/* Apply to outer or inner element */}
      <ListItemButton
        data-testid='create-repo-button'
        onClick={handleSelect}
        sx={{
          borderRadius: 2,
          p: 1.2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0.5,
          transition: 'none',
          '&:hover': {
            background: 'transparent',
          },
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 'auto',
              color: alpha(palette.primary.main, 0.9),
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={title}
            sx={{
              margin: 0,
              flex: 1,
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              letterSpacing: '0.01em',
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleShowDocs();
            }}
            sx={{
              color: alpha(palette.primary.main, 0.8),
              transition: 'all 0.2s ease',
              '&:hover': {
                color: alpha(palette.primary.main, 0.9),
                background: alpha(palette.primary.main, 0.15),
                transform: 'scale(1.1)',
              },
            }}
          >
            <Info fontSize="small" />
          </IconButton>
        </Box>

        {/* Description Text */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.8rem',
            fontFamily: '"IBM Plex Sans", sans-serif',
            lineHeight: 1.4,
            pl: 1,
            width: '100%',
          }}
        >
          {subText}
        </Typography>
      </ListItemButton>
    </ThemedOptionCard>
  );
};

export default OptionCard;
