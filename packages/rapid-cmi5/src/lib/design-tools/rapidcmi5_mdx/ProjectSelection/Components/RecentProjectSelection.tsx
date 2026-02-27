import {
  Typography,
  IconButton,
  ListItemText,
  ListItemButton,
  TextField,
  InputAdornment,
  Alert,
  AlertTitle,
  Tooltip,
  Checkbox,
  Button,
  Switch,
} from '@mui/material';
import { alpha, Box, Stack, useTheme } from '@mui/system';
import { History, Search, Clear, Info } from '@mui/icons-material';
import { GlassCard } from './GlassCard';

import ThemedOptionCard from './ThemedOption';
import { DirMeta, formatRelativeTime } from '@rapid-cmi5/cmi5-build-common';
import { useState, useMemo } from 'react';

export type RecentProjectSelectionProps = {
  recentProjects: DirMeta[];
  onOpenRecentProject: (path: string) => void;
  onRemoveRecentProject: (path: string[]) => Promise<void>;
  isDisabled?: boolean;
};

export default function RecentProjectSelection({
  recentProjects,
  onOpenRecentProject,
  onRemoveRecentProject,
  isDisabled = false,
}: RecentProjectSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
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

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setSelectedIds(new Set());
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemoveSelected = async () => {
    setIsRemoving(true);
    await onRemoveRecentProject([...selectedIds])
    setIsRemoving(false);
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const editButton =
    recentProjects.length > 0 ? (
      <Tooltip
        title={isEditMode ? 'Exit edit mode' : 'Select projects to remove'}
        placement="left"
        arrow
      >
        <Switch
          checked={isEditMode}
          onChange={(e) => e.target.checked ? handleEnterEditMode() : handleCancelEditMode()}
          disabled={isDisabled}
        />
      </Tooltip>
    ) : null;

  return (
    <GlassCard
      sx={{ height: 'clamp(650px, 80vh, 700px)' }}
      title="Recent Projects"
      icon={<History sx={{ color: 'white' }} />}
      headerAction={editButton}
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
        {/* Edit mode info banner */}
        {isEditMode && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              mb: 2,
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: alpha(palette.info.main, 0.08),
              border: `1px solid ${alpha(palette.info.main, 0.2)}`,
              flexShrink: 0,
            }}
          >
            <Info
              sx={{ fontSize: 16, color: 'info.main', mt: 0.15, flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"IBM Plex Sans", sans-serif',
                color: 'text.secondary',
                lineHeight: 1.5,
              }}
            >
              Select projects to remove from this list. Projects won't be
              deleted — they'll reappear here if opened again.
            </Typography>
          </Box>
        )}

        {/* Search Bar */}
        {recentProjects.length > 0 && (
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
        )}

        {/* Scrollable Projects List */}
        <Box
          sx={{
            flex: 1,
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            {filteredProjects.map((project) => (
              <ThemedOptionCard key={project.id}>
                <ListItemButton
                  onClick={() => {
                    if (isEditMode) {
                      handleToggleSelect(project.id);
                    } else {
                      onOpenRecentProject(project.id);
                    }
                  }}
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
                  {isEditMode && (
                    <Checkbox
                      checked={selectedIds.has(project.id)}
                      size="small"
                      disableRipple
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleSelect(project.id)}
                      sx={{
                        p: 0,
                        flexShrink: 0,
                        color: alpha(palette.error.main, 0.5),
                        '&.Mui-checked': { color: 'error.main' },
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={project.name}
                        sx={{
                          margin: 0,
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
                        Last Accessed:{' '}
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
                            fontFamily: '"Space Mono", monospace',
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
        </Box>

        {filteredProjects.length === 0 && recentProjects.length > 0 && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
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
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography
              variant="body1"
              sx={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              No recent projects yet
            </Typography>
          </Box>
        )}

        {filteredProjects.some((project) => !project.isValid) && (
          <Alert severity="warning" sx={{ lineHeight: 1, mt: 2 }}>
            <AlertTitle sx={{ lineHeight: 1, fontWeight: 'bold' }}>
              Browser Requires Permission to Access Desktop Files
            </AlertTitle>
            <Stack direction="column">
              You must click allow access when the browser prompts you.
            </Stack>
          </Alert>
        )}

        {/* Edit mode action bar */}
        {isEditMode && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelEditMode}
              disabled={isRemoving}
              sx={{ fontFamily: '"IBM Plex Sans", sans-serif', flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleRemoveSelected}
              disabled={selectedIds.size === 0 || isRemoving}
              sx={{ fontFamily: '"IBM Plex Sans", sans-serif', flex: 1 }}
            >
              {isRemoving
                ? 'Removing…'
                : `Remove Selected${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </Button>
          </Stack>
        )}
      </Box>
    </GlassCard>
  );
}
