import {
  Typography,
  IconButton,
  ListItemText,
  ListItemButton,
  TextField,
  InputAdornment,
  Alert,
  AlertTitle,
} from '@mui/material';
import { alpha, Box, Stack, useTheme } from '@mui/system';
import { History, Search, Clear } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { DirMeta } from '../../../course-builder/GitViewer/utils/fileSystem';
import { GlassCard } from './GlassCard';
import ThemedOptionCard from './ThemedOption';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

const formatRelativeTime = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);

  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export default function RecentProjectSelection({
  recentProjects,
  openRecentProject,
}: {
  recentProjects: DirMeta[];
  openRecentProject: (path: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const { palette } = theme;

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return recentProjects;

    const query = searchQuery.toLowerCase();
    return recentProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.remoteUrl?.toLowerCase().includes(query),
    );
  }, [recentProjects, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <GlassCard
      sx={{ height: 'clamp(650px, 80vh, 700px)' }}
      title="Recent Projects"
      icon={<History sx={{ color: 'white' }} />}
    >
      <Box
        data-testid="recent-projects-card"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Search Bar */}
        {recentProjects.length > 0 && (
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearchChange}
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
                    sx={{
                      width: 24,
                      height: 24,
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Scrollable Projects List */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            pr: 1,
            mr: -1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(palette.background.paper, 0.3),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(palette.primary.main, 0.3),
              borderRadius: '4px',
              '&:hover': {
                background: alpha(palette.primary.main, 0.5),
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2,
            }}
          >
            {filteredProjects.map((project) => (
              <ThemedOptionCard key={project.id}>
                <ListItemButton
                  onClick={() => openRecentProject(project.id)}
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
                  <Box sx={{ mb: 1 }}>
                    <ListItemText
                      primary={project.name}
                      sx={{
                        margin: 0,
                        flex: 1,
                        fontFamily: '"IBM Plex Sans", sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        letterSpacing: '0.01em',
                      }}
                    />

                    {/* {!project.isValid && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          background: alpha(palette.warning.light, 0.1),
                          border: `1px solid ${alpha(palette.warning.main, 0.5)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: '"Space Mono", monospace',
                            fontSize: '0.7rem',
                            color: palette.warning.main,
                          }}
                        >
                          ⚠ Needs permission
                        </Typography>
                      </Box>
                    )} */}
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"IBM Plex Sans", sans-serif',
                        fontSize: '0.75rem',
                        color: alpha(palette.text.primary, 0.7),
                      }}
                    >
                      {formatRelativeTime(project.lastAccessed)}
                    </Typography>

                    {project.remoteUrl && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Space Mono", monospace',
                          fontSize: '0.7rem',
                          color: alpha(palette.text.primary, 0.5),
                        }}
                      >
                        {project.remoteUrl}
                      </Typography>
                    )}
                  </Stack>
                </ListItemButton>
              </ThemedOptionCard>
            ))}
          </Box>
        </Box>

        {filteredProjects.length === 0 && recentProjects.length > 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"IBM Plex Sans", sans-serif',
                color: 'text.secondary',
              }}
            >
              No projects match "{searchQuery}"
            </Typography>
          </Box>
        )}

        {recentProjects.length === 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"IBM Plex Sans", sans-serif',
              }}
            >
              No recent projects yet
            </Typography>
          </Box>
        )}
        {filteredProjects.some((project) => project.isValid === false) && (
          <Alert severity="warning" sx={{ lineHeight: 1, mt: 2 }}>
            <AlertTitle sx={{ lineHeight: 1, fontWeight: 'bold' }}>
              Browser Access Required
            </AlertTitle>
            <Stack direction="column">
              In order to access local projects, you must click allow access
              when the browser prompts you.
            </Stack>
          </Alert>
        )}
      </Box>
    </GlassCard>
  );
}
