import {
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Box as MuiBox,
  ListItemText,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import { alpha, Box, palette, Stack, useTheme } from '@mui/system';
import { History, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useState } from 'react';
import { DirMeta } from '../../../course-builder/GitViewer/utils/fileSystem';
import { GlassCard } from './GlassCard';
import ThemedOptionCard from './ThemedOption';

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

const PROJECTS_PER_PAGE = 4;

export default function RecentProjectSelection({
  recentProjects,
  openRecentProject,
}: {
  recentProjects: DirMeta[];
  openRecentProject: (path: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useTheme();
  const { palette } = theme;
  const totalPages = Math.ceil(recentProjects.length / PROJECTS_PER_PAGE);
  const startIndex = currentPage * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = recentProjects.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <GlassCard
      title="Recent Projects"
      icon={<History sx={{ color: 'white' }} />}
    >
      <Box
        sx={{
          height: '100%', // IMPORTANT: parent must have a height
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // IMPORTANT for overflow in flex children
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(1fr)' },
            gap: 2,
            mb: 1,
          }}
        >
          {currentProjects.map((project, index) => (
            <ThemedOptionCard>
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

                  {!project.isValid && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        background: alpha(palette.warning.main, 0.1),
                        border: `1px solid ${alpha(palette.warning.main, 0.3)}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Space Mono", monospace',
                          fontSize: '0.7rem',
                          color: palette.warning.light,
                        }}
                      >
                        ⚠ Needs permission
                      </Typography>
                    </Box>
                  )}
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
            //   </CardContent>
            // </Card>
          ))}
        </Box>
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

        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
              mt: 'auto',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                  '&.Mui-disabled': {
                    borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                    color: 'text.disabled',
                  },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  minWidth: '60px',
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {currentPage + 1} / {totalPages}
              </Typography>

              <IconButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                  '&.Mui-disabled': {
                    borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                    color: 'text.disabled',
                  },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Box>
    </GlassCard>
  );
}
