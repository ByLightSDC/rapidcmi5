import { Search, Clear } from '@mui/icons-material';
import { alpha, IconButton, InputAdornment, TextField } from '@mui/material';
import { palette, useTheme } from '@mui/system';

export default function SearchBar({
  searchQuery,
  isDisabled,
  handleSearchChange,
  handleClearSearch,
}: {
  searchQuery: string;
  isDisabled: boolean;
  handleSearchChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  handleClearSearch: () => void;
}) {
  const theme = useTheme();
  const { palette } = theme;
  return (
    <>
      <TextField
        size="small"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isDisabled}
        sx={{
          mb: 2,
          flexShrink: 0,
          '& .MuiOutlinedInput-root': {
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '0.875rem',
            backgroundColor: alpha(palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(palette.background.paper, 0.7),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(palette.background.paper, 0.8),
              boxShadow: `0 0 0 2px ${alpha(palette.primary.main, 0.2)}`,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
                disabled={isDisabled}
                sx={{
                  width: 24,
                  height: 24,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Clear sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </>
  );
}
