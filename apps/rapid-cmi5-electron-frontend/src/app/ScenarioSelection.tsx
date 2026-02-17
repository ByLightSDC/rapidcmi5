import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { config } from '@rapid-cmi5/ui';
import type { ScenarioFormProps } from '@rapid-cmi5/react-editor';

export interface Scenario {
  uuid: string;
  name: string;
  author: string;
  dateEdited: string;
  description: string;
  dateCreated: string;
  packages?: string[];
  drafts?: string[];
  metadata_tags?: string[];
}

/* MUI */
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Stack,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Fade,
  Grow,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

interface ApiResponse {
  offset: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  data: Scenario[];
}

interface ScenarioFormData {
  selectedScenarioId: string;
}

const ITEMS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 400;

export function MyScenariosForm({ submitForm, token }: ScenarioFormProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ScenarioFormData>({
    defaultValues: { selectedScenarioId: '' },
  });

  const selectedScenarioId = watch('selectedScenarioId');

  // Server-side fetch with pagination and search
  const getScenarios = useCallback(
    async (page: number, search: string) => {
      if (!token) return;

      try {
        setIsLoading(true);
        const offset = (page - 1) * ITEMS_PER_PAGE;

        const params: Record<string, string | number> = {
          offset,
          limit: ITEMS_PER_PAGE,
          sortBy: 'dateEdited',
          sort: 'desc',
        };

        // Add search parameter if searching
        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await axios.get<ApiResponse>(
          `${config.DEVOPS_API_URL}/v1/content/range/scenarios`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }
        );

        setScenarios(response.data?.data ?? []);
        setTotalCount(response.data?.totalCount ?? 0);
        setTotalPages(response.data?.totalPages ?? 0);
      } catch (e) {
        console.error('Could not retrieve available projects from PCTE', e);
        setScenarios([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch scenarios when dialog opens, page changes, or search changes
  useEffect(() => {
    if (open && token) {
      getScenarios(currentPage, debouncedSearch);
    }
  }, [open, token, currentPage, debouncedSearch, getScenarios]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      reset({ selectedScenarioId: '' });
      setSearchQuery('');
      setDebouncedSearch('');
      setCurrentPage(1);
      setScenarios([]);
    }
  }, [open, reset]);

  // Scroll to top when page changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const onSubmit = async (data: ScenarioFormData) => {
    const selectedScenario = scenarios.find(
      (s) => s.uuid === data.selectedScenarioId
    );
    if (!selectedScenario) return;

    submitForm(selectedScenario);
    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // Refined color palette
  const colors = {
    background: theme.palette.mode === 'dark' ? '#0a0a0a' : '#fafafa',
    surface: theme.palette.mode === 'dark' ? '#141414' : '#ffffff',
    surfaceHover: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
    surfaceSelected:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.main, 0.08)
        : alpha(theme.palette.primary.main, 0.04),
    border: theme.palette.mode === 'dark' ? '#262626' : '#e5e5e5',
    borderHover: theme.palette.mode === 'dark' ? '#404040' : '#d4d4d4',
    borderSelected: theme.palette.primary.main,
    textPrimary: theme.palette.mode === 'dark' ? '#fafafa' : '#0a0a0a',
    textSecondary: theme.palette.mode === 'dark' ? '#a3a3a3' : '#737373',
    textTertiary: theme.palette.mode === 'dark' ? '#737373' : '#a3a3a3',
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          px: 3,
          py: 1.25,
          borderColor: colors.border,
          color: colors.textPrimary,
          '&:hover': {
            borderColor: colors.borderHover,
            bgcolor: colors.surfaceHover,
          },
        }}
      >
        Select Scenario
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        transitionDuration={200}
        PaperProps={{
          sx: {
            height: '85vh',
            maxHeight: '900px',
            borderRadius: 3,
            bgcolor: colors.background,
            backgroundImage: 'none',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 0,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
            }}
          >
            <Box sx={{ width: 40 }} /> {/* Spacer for centering */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              letterSpacing="-0.01em"
              sx={{ color: colors.textPrimary }}
            >
              Select Scenario
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpen(false)}
              sx={{
                color: colors.textSecondary,
                '&:hover': { bgcolor: colors.surfaceHover },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Search Bar */}
          <Box sx={{ px: 3, pb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: colors.textTertiary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: isLoading && searchQuery && (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: colors.background,
                  fontSize: '0.9375rem',
                  '& fieldset': {
                    borderColor: colors.border,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.borderHover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.borderSelected,
                    borderWidth: 1,
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.25,
                  color: colors.textPrimary,
                  '&::placeholder': {
                    color: colors.textTertiary,
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent
          ref={contentRef}
          sx={{
            p: 0,
            bgcolor: colors.background,
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: colors.border,
              borderRadius: 4,
              '&:hover': {
                bgcolor: colors.borderHover,
              },
            },
          }}
        >
          {/* Results Summary */}
          {!isLoading && totalCount > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3,
                py: 1.5,
                borderBottom: `1px solid ${colors.border}`,
                bgcolor: colors.surface,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {debouncedSearch
                  ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${debouncedSearch}"`
                  : `${totalCount} scenario${totalCount !== 1 ? 's' : ''}`}
              </Typography>
              {selectedScenarioId && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label="1 selected"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: 'none',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
              )}
            </Box>
          )}

          {/* Loading State */}
          {isLoading ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={24}
                        sx={{ bgcolor: colors.surfaceHover }}
                      />
                      <Stack direction="row" spacing={2}>
                        <Skeleton
                          variant="text"
                          width={100}
                          height={16}
                          sx={{ bgcolor: colors.surfaceHover }}
                        />
                        <Skeleton
                          variant="text"
                          width={80}
                          height={16}
                          sx={{ bgcolor: colors.surfaceHover }}
                        />
                      </Stack>
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={16}
                        sx={{ bgcolor: colors.surfaceHover }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          ) : scenarios.length === 0 ? (
            /* Empty State */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 12,
                px: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: colors.surfaceHover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <FolderOpenIcon
                  sx={{ fontSize: 36, color: colors.textTertiary }}
                />
              </Box>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: colors.textPrimary, mb: 1 }}
              >
                {debouncedSearch ? 'No results found' : 'No scenarios'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.textSecondary, textAlign: 'center' }}
              >
                {debouncedSearch
                  ? `Try adjusting your search terms`
                  : 'Create your first scenario to get started'}
              </Typography>
            </Box>
          ) : (
            /* Scenario List */
            <Box sx={{ p: 3 }}>
              <FormControl error={!!errors.selectedScenarioId} fullWidth>
                <Controller
                  name="selectedScenarioId"
                  control={control}
                  rules={{ required: 'Please select a scenario' }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <Stack spacing={1.5}>
                        {scenarios.map((scenario, index) => {
                          const isSelected =
                            selectedScenarioId === scenario.uuid;
                          return (
                            <Grow
                              key={scenario.uuid}
                              in
                              timeout={150 + index * 30}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  border: '1px solid',
                                  borderColor: isSelected
                                    ? colors.borderSelected
                                    : colors.border,
                                  borderRadius: 2,
                                  bgcolor: isSelected
                                    ? colors.surfaceSelected
                                    : colors.surface,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  overflow: 'hidden',
                                  '&:hover': {
                                    borderColor: isSelected
                                      ? colors.borderSelected
                                      : colors.borderHover,
                                    bgcolor: isSelected
                                      ? colors.surfaceSelected
                                      : colors.surfaceHover,
                                    transform: 'translateY(-1px)',
                                    boxShadow: isSelected
                                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                                      : `0 2px 8px ${alpha('#000', 0.06)}`,
                                  },
                                  '&:active': {
                                    transform: 'translateY(0)',
                                  },
                                }}
                                onClick={() => field.onChange(scenario.uuid)}
                              >
                                {/* Selection indicator */}
                                {isSelected && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: 3,
                                      bgcolor: theme.palette.primary.main,
                                      borderRadius: '3px 0 0 3px',
                                    }}
                                  />
                                )}

                                <FormControlLabel
                                  value={scenario.uuid}
                                  control={
                                    <Radio
                                      sx={{
                                        display: 'none',
                                      }}
                                    />
                                  }
                                  sx={{ m: 0, width: '100%' }}
                                  label={
                                    <Box sx={{ p: 2, pl: isSelected ? 2.5 : 2 }}>
                                      <Stack spacing={1.25}>
                                        {/* Title Row */}
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                          }}
                                        >
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                            sx={{
                                              color: colors.textPrimary,
                                              lineHeight: 1.4,
                                              letterSpacing: '-0.01em',
                                            }}
                                          >
                                            {scenario.name}
                                          </Typography>
                                          {isSelected && (
                                            <CheckCircleIcon
                                              sx={{
                                                fontSize: 20,
                                                color:
                                                  theme.palette.primary.main,
                                                flexShrink: 0,
                                              }}
                                            />
                                          )}
                                        </Box>

                                        {/* Metadata Row */}
                                        <Stack
                                          direction="row"
                                          spacing={2}
                                          sx={{ flexWrap: 'wrap', gap: 1 }}
                                        >
                                          <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                          >
                                            <PersonOutlineIcon
                                              sx={{
                                                fontSize: 15,
                                                color: colors.textTertiary,
                                              }}
                                            />
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: colors.textSecondary,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {scenario.author}
                                            </Typography>
                                          </Stack>
                                          <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                          >
                                            <AccessTimeIcon
                                              sx={{
                                                fontSize: 15,
                                                color: colors.textTertiary,
                                              }}
                                            />
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: colors.textSecondary,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {formatDate(scenario.dateEdited)}
                                            </Typography>
                                          </Stack>
                                        </Stack>

                                        {/* Description */}
                                        {scenario.description && (
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: colors.textSecondary,
                                              lineHeight: 1.5,
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden',
                                            }}
                                          >
                                            {scenario.description}
                                          </Typography>
                                        )}
                                      </Stack>
                                    </Box>
                                  }
                                />
                              </Box>
                            </Grow>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  )}
                />

                {!!errors.selectedScenarioId?.message && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 2, display: 'block' }}
                  >
                    {errors.selectedScenarioId.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}
        </DialogContent>

        {/* Footer with Pagination */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            justifyContent: 'space-between',
          }}
        >
          {/* Pagination */}
          {totalPages > 1 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mr: 1 }}
              >
                {startItem}–{endItem} of {totalCount}
              </Typography>

              <IconButton
                size="small"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || isLoading}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.surfaceHover },
                  '&.Mui-disabled': { color: colors.textTertiary },
                }}
              >
                <FirstPageIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.surfaceHover },
                  '&.Mui-disabled': { color: colors.textTertiary },
                }}
              >
                <KeyboardArrowLeftIcon fontSize="small" />
              </IconButton>

              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: colors.background,
                  minWidth: 60,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color: colors.textPrimary }}
                >
                  {currentPage} / {totalPages}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.surfaceHover },
                  '&.Mui-disabled': { color: colors.textTertiary },
                }}
              >
                <KeyboardArrowRightIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.surfaceHover },
                  '&.Mui-disabled': { color: colors.textTertiary },
                }}
              >
                <LastPageIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box />
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={() => setOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2.5,
                color: colors.textSecondary,
                '&:hover': {
                  bgcolor: colors.surfaceHover,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading || !selectedScenarioId}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&:disabled': {
                  bgcolor: colors.surfaceHover,
                  color: colors.textTertiary,
                },
              }}
            >
              Select
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}