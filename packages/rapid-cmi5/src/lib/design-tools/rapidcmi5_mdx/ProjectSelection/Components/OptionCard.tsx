import { Info } from '@mui/icons-material';
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
  disabled = false,
  'data-testid': dataTestId, // Accept data-testid prop
}: {
  title: string;
  handleSelect: () => void;
  handleShowDocs: () => void;
  subText: JSX.Element;
  icon: JSX.Element;
  disabled?: boolean;
  'data-testid'?: string; // Add to type definition
}) => {
  const theme = useTheme();
  const { palette } = theme;

  return (
    <ThemedOptionCard>
      <Box sx={{ position: 'relative' }}>
        <ListItemButton
          data-testid={dataTestId}
          onClick={handleSelect}
          disabled={disabled}
          sx={{
            borderRadius: 2,
            p: 1.5,
            minWidth: 0,
            minHeight: 88,
            pr: 5,
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
                minWidth: 0,
                '& .MuiListItemText-primary': {
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  overflowWrap: 'anywhere',
                },
                flex: 1,
                fontFamily: '"IBM Plex Sans", sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                letterSpacing: '0.01em',
              }}
            />
          </Box>

          {/* Description Text */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              fontFamily: '"IBM Plex Sans", sans-serif',
              lineHeight: 1.4,
              pl: 0,
              color: 'text.secondary',
              overflowWrap: 'anywhere',
              width: '100%',
            }}
          >
            {subText}
          </Typography>
        </ListItemButton>

        <IconButton
          aria-label={`Information about ${title}`}
          size="small"
          onClick={handleShowDocs}
          disabled={disabled}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
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
    </ThemedOptionCard>
  );
};

export default OptionCard;
