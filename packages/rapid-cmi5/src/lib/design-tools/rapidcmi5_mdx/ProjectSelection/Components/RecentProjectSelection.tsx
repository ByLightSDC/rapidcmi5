import {
  Typography,
  ListItemText,
  ListItemButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import { alpha, Box, Stack, useTheme } from '@mui/system';
import { History } from '@mui/icons-material';
import { GlassCard } from './GlassCard';

import ThemedOptionCard from './ThemedOption';
import { DirMeta } from '@rapid-cmi5/cmi5-build-common';
import { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import { formatRelativeTime } from '@rapid-cmi5/ui';

export type RecentProjectSelectionProps = {
  recentProjects: DirMeta[];
  onOpenRecentProject: (path: string) => void;
  isDisabled?: boolean;
};

export default function RecentProjectSelection({
  recentProjects,
  onOpenRecentProject,
  isDisabled = false,
}: RecentProjectSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const { palette } = theme;

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
  const ariaLabelId = 'recent-projects';
  return (
    <GlassCard
      ariaLabelId={ariaLabelId}
      sx={{ maxHeight: { xs: 'none', md: 'min(700px, 80dvh)' } }}
      title="Recent Projects"
      icon={<History sx={{ color: 'white' }} />}
    >
      <Box
        data-testid="recent-projects-card"
        sx={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* Search Bar */}
        {recentProjects.length > 0 && (
          <SearchBar
            handleClearSearch={handleClearSearch}
            handleSearchChange={handleSearchChange}
            isDisabled={isDisabled}
            searchQuery={searchQuery}
          />
        )}

        {/* Scrollable Projects List */}
        <Box
          sx={{
            flex: '1 1 auto',
            maxHeight: { xs: 420, md: 'none' },
            overflowY: 'auto',
            minHeight: 0,
            pr: 1,
            mr: -1,
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': {
              background: alpha(palette.background.paper, 0.3),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(palette.primary.main, 0.3),
              borderRadius: '4px',
              '&:hover': { background: alpha(palette.primary.main, 0.5) },
            },
          }}
        >
          <nav aria-labelledby={ariaLabelId}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {filteredProjects.map((project) => (
                <ThemedOptionCard key={project.id}>
                  <ListItemButton
                    onClick={() => onOpenRecentProject(project.id)}
                    disabled={isDisabled}
                    sx={{
                      borderRadius: 2,
                      p: 1.2,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'none',
                      '&:hover': { background: 'transparent' },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ mb: 0.5 }}>
                        <ListItemText
                          primary={project.name}
                          sx={{
                            margin: 0,
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              textTransform: 'none',
                              overflowWrap: 'anywhere',
                            },
                            fontFamily: '"IBM Plex Sans", sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            letterSpacing: '0.01em',
                          }}
                        />
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
                          Last opened:{' '}
                          {formatRelativeTime(project.lastAccessed)}
                        </Typography>
                        {project.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"IBM Plex Sans", sans-serif',
                              fontSize: '0.75rem',
                              color: alpha(palette.text.primary, 0.7),
                            }}
                          >
                            Created: {formatRelativeTime(project.createdAt)}
                          </Typography>
                        )}
                        {project.remoteUrl && (
                          <Typography
                            variant="caption"
                            sx={{
                              overflowWrap: 'anywhere',
                              fontFamily: 'inherit',
                              fontSize: '0.7rem',
                              color: alpha(palette.text.primary, 0.5),
                            }}
                          >
                            {project.remoteUrl}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </ListItemButton>
                </ThemedOptionCard>
              ))}
            </Box>
          </nav>
        </Box>

        {filteredProjects.length === 0 && recentProjects.length > 0 && (
          <Box sx={{ py: 4, textAlign: 'center', overflowWrap: 'anywhere' }}>
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
          <Box sx={{ py: 4, textAlign: 'center', overflowWrap: 'anywhere' }}>
            <Typography
              variant="body1"
              sx={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              No recent projects yet. Open or create a project to get started.
            </Typography>
          </Box>
        )}

        {filteredProjects.some((project) => !project.isValid) && (
          <Alert severity="warning" sx={{ mt: 2, flexShrink: 0 }}>
            <AlertTitle sx={{ fontWeight: 600 }}>
              Allow access to project files
            </AlertTitle>
            <Stack direction="column">
              You must click allow access when the browser prompts you.
            </Stack>
          </Alert>
        )}
      </Box>
    </GlassCard>
  );
}
