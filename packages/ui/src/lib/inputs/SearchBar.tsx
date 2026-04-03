import { Search, Clear } from '@mui/icons-material';
import { alpha, CircularProgress, IconButton, InputAdornment, TextField, useTheme } from '@mui/material';

export function SearchBar({
  searchQuery,
  isDisabled,
  isLoading = false,
  fullWidth = false,
  placeholder = 'Search...',
  handleSearchChange,
  handleClearSearch,
}: {
  searchQuery: string;
  isDisabled: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  handleSearchChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  handleClearSearch: () => void;
}) {
  const theme = useTheme();

  const endAdornment = isLoading ? (
    <InputAdornment position="end">
      <CircularProgress size={16} />
    </InputAdornment>
  ) : searchQuery ? (
    <InputAdornment position="end">
      <IconButton
        size="small"
        onClick={handleClearSearch}
        edge="end"
        disabled={isDisabled}
        sx={{ width: 24, height: 24, '&:hover': { color: 'primary.main' } }}
      >
        <Clear sx={{ fontSize: 16 }} />
      </IconButton>
    </InputAdornment>
  ) : null;

  return (
    <TextField
      size="small"
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleSearchChange}
      disabled={isDisabled}
      sx={{
        mb: 2,
        flexShrink: 0,
        '& .MuiOutlinedInput-root': {
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: '0.875rem',
          backgroundColor: alpha(theme.palette['background']['paper'], 0.5),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette['background']['paper'], 0.7),
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette['background']['paper'], 0.8),
            boxShadow: `0 0 0 2px ${alpha(theme.palette['primary']['main'], 0.2)}`,
          },
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment,
        },
      }}
    />
  );
}
