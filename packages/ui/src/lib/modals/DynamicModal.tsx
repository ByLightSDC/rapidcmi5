/*
  This modal is for using with dynamic search data, most likely interacting with an API
*/

import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
/* MUI */
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Stack,
  Box,
  Chip,
  Skeleton,
  Fade,
  Grow,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SearchBar } from '../inputs/SearchBar';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { ButtonMinorUi } from '../utility/buttons';

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
}

export interface DynamicModalProps<T> {
  /** Called with the selected item (single-select mode) */
  onSelect: (item: T) => void;
  /** Fetches a page of items — called on open, page change, or search change */
  fetchItems: (
    page: number,
    search: string,
    itemsPerPage: number,
  ) => Promise<PagedResult<T>>;
  /** Returns a stable unique ID for each item */
  getItemId: (item: T) => string;
  /**
   * Renders the content inside a selectable card.
   * @param isExpanded - whether the item is currently expanded
   * @param onToggleExpand - call with the MouseEvent to toggle expand (stops propagation internally)
   */
  renderItem: (
    item: T,
    isSelected: boolean,
    isExpanded: boolean,
    onToggleExpand: (e: React.MouseEvent) => void,
    onDelete?: (id: string) => Promise<void>,
  ) => ReactNode;

  // --- Text / labels ---
  /** Dialog title (default: "Select Item") */
  title?: string;
  /** Search field placeholder (default: "Search...") */
  searchPlaceholder?: string;
  /** Empty-state heading when no search is active (default: "No items") */
  emptyTitle?: string;
  /** Empty-state body when no search is active (default: "No items to display") */
  emptyDescription?: string;
  /** Noun used in count labels, e.g. "scenario" → "42 scenarios" (default: "item") */
  itemLabel?: string;
  /** Label for the trigger / confirm button (default: "Select") */
  triggerLabel?: string;
  /** Icon to display at the start of the trigger button */
  triggerStartIcon?: ReactNode;
  /** Items per page (default: 50) */
  itemsPerPage?: number;

  // --- Multi-select ---
  /** Enable checkbox-style multi-selection */
  multiSelect?: boolean;
  /** Called with all selected items when the user confirms in multi-select mode */
  onMultiSelect?: (items: T[]) => void;

  // --- Controlled open (skips the trigger button) ---
  /** When provided the dialog is controlled externally; the trigger button is hidden */
  open?: boolean;
  /** Called when the dialog should close (required when `open` is provided) */
  onClose?: () => void;

  /** Called when the user is allowed to delete an item **/
  onDelete?: (id: string) => Promise<void>;
}

interface SelectionFormData {
  selectedId: string;
}

const SEARCH_DEBOUNCE_MS = 400;
const ROW_HEIGHT = 42;

export function DynamicModal<T>({
  onSelect,
  fetchItems,
  getItemId,
  renderItem,
  title = 'Select Item',
  searchPlaceholder = 'Search...',
  emptyTitle = 'No items',
  emptyDescription = 'No items to display',
  itemLabel = 'item',
  triggerLabel = 'Select',
  triggerStartIcon,
  itemsPerPage = 50,
  multiSelect = false,
  onMultiSelect,
  open: controlledOpen,
  onClose: controlledOnClose,
  onDelete,
}: DynamicModalProps<T>) {
  const theme = useTheme();
  const isControlled = controlledOpen !== undefined;

  // --- Open state ---
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen! : internalOpen;

  const handleClose = useCallback(() => {
    if (isControlled) controlledOnClose?.();
    else setInternalOpen(false);
  }, [isControlled, controlledOnClose]);

  // --- Data ---
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Selection ---
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(
    new Set(),
  );

  // --- Expand ---
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Single-select form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SelectionFormData>({ defaultValues: { selectedId: '' } });
  const selectedId = watch('selectedId');

  const handleDeleteItem = onDelete
    ? async (id: string) => {
        await onDelete(id);
        setItems((prev) => prev.filter((item) => getItemId(item) !== id));
        setTotalCount((prev) => prev - 1);
      }
    : undefined;

  const colors = {
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    surfaceHover: alpha(theme.palette.action.hover, 0.01),
    surfaceSelected: alpha(theme.palette.primary.main, 0.08),
    border: theme.palette.divider,
    borderHover: alpha(theme.palette.action.hover, 0.4),
    borderSelected: theme.palette.primary.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textTertiary: alpha(theme.palette.text.secondary, 0.7),
  };

  const loadItems = useCallback(
    async (page: number, search: string) => {
      try {
        setIsLoading(true);
        const result = await fetchItems(page, search, itemsPerPage);
        setItems(result.data ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 0);
      } catch (e) {
        console.error('DynamicModal: fetchItems failed', e);
        setItems([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchItems],
  );

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Fetch on open / page / search change
  useEffect(() => {
    if (isOpen) loadItems(currentPage, debouncedSearch);
  }, [isOpen, currentPage, debouncedSearch, loadItems]);

  // Reset all local state on close
  useEffect(() => {
    if (!isOpen) {
      reset({ selectedId: '' });
      setSearchQuery('');
      setDebouncedSearch('');
      setCurrentPage(1);
      setItems([]);
      setMultiSelectedIds(new Set());
      setExpandedIds(new Set());
    }
  }, [isOpen, reset]);

  // Scroll to top on page change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // --- Handlers ---
  const onSubmit = (data: SelectionFormData) => {
    const found = items.find((item) => getItemId(item) === data.selectedId);
    if (!found) return;
    onSelect(found);
    handleClose();
  };

  const onMultiSubmit = () => {
    if (!onMultiSelect) return;
    const chosen = items.filter((item) =>
      multiSelectedIds.has(getItemId(item)),
    );
    onMultiSelect(chosen);
    handleClose();
  };

  const handleMultiToggle = (id: string) => {
    setMultiSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);
  const pluralLabel = `${itemLabel}${totalCount !== 1 ? 's' : ''}`;
  const selectionCount = multiSelect
    ? multiSelectedIds.size
    : selectedId
      ? 1
      : 0;

  return (
    <Box sx={{ my: isControlled ? 0 : 1 }}>
      {/* Trigger button — only in uncontrolled mode */}
      {!isControlled && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 1.5,
            width: '100%',
          }}
        >
          <ButtonMinorUi
            onClick={() => setInternalOpen(true)}
            fullWidth
            startIcon={triggerStartIcon}
            sx={{ height: ROW_HEIGHT, boxSizing: 'border-box' }}
          >
            {triggerLabel}
          </ButtonMinorUi>
        </Box>
      )}

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        TransitionComponent={Fade}
        transitionDuration={200}
        PaperProps={{
          sx: {
            width: { xs: '95vw', sm: '80vw', md: '700px', lg: '800px' },
            height: '85vh',
            maxHeight: '900px',
            borderRadius: 3,
            bgcolor: colors.background,
            backgroundImage: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 0,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            flexShrink: 0,
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
            <Box sx={{ width: 40 }} />
            <Typography
              variant="subtitle1"
              fontWeight={600}
              letterSpacing="-0.01em"
              sx={{ color: colors.textPrimary }}
            >
              {title}
            </Typography>
            <IconButton
              aria-label="Close"
              onClick={handleClose}
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
            <SearchBar
              searchQuery={searchQuery}
              isDisabled={isLoading}
              isLoading={isLoading}
              fullWidth
              placeholder={searchPlaceholder}
              handleSearchChange={(e) => setSearchQuery(e.target.value)}
              handleClearSearch={() => setSearchQuery('')}
            />
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent
          ref={contentRef}
          sx={{
            p: 0,
            bgcolor: colors.background,
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: colors.border,
              borderRadius: 4,
              '&:hover': { bgcolor: colors.borderHover },
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
                flexShrink: 0,
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
                  : `${totalCount} ${pluralLabel}`}
              </Typography>
              {selectionCount > 0 && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label={`${selectionCount} selected`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: 'none',
                    '& .MuiChip-icon': { color: 'inherit' },
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
          ) : items.length === 0 ? (
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
                {debouncedSearch ? 'No results found' : emptyTitle}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.textSecondary, textAlign: 'center' }}
              >
                {debouncedSearch
                  ? 'Try adjusting your search terms'
                  : emptyDescription}
              </Typography>
            </Box>
          ) : multiSelect ? (
            /* ── Multi-select list ── */
            <Box sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                {items.map((item, index) => {
                  const id = getItemId(item);
                  const isSelected = multiSelectedIds.has(id);
                  const isExpanded = expandedIds.has(id);
                  return (
                    <Grow key={id} in timeout={150 + index * 30}>
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
                          '&:active': { transform: 'translateY(0)' },
                        }}
                        onClick={() => handleMultiToggle(id)}
                      >
                        {renderItem(
                          item,
                          isSelected,
                          isExpanded,
                          (e) => handleToggleExpand(id, e),
                          handleDeleteItem,
                        )}
                      </Box>
                    </Grow>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            /* ── Single-select list ── */
            <Box sx={{ p: 3 }}>
              <FormControl error={!!errors.selectedId} fullWidth>
                <Controller
                  name="selectedId"
                  control={control}
                  rules={{ required: 'Please select an item' }}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      <Stack spacing={1.5}>
                        {items.map((item, index) => {
                          const id = getItemId(item);
                          const isSelected = selectedId === id;
                          const isExpanded = expandedIds.has(id);
                          return (
                            <Grow key={id} in timeout={150 + index * 30}>
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
                                  '&:active': { transform: 'translateY(0)' },
                                }}
                                onClick={() => field.onChange(id)}
                              >
                                <FormControlLabel
                                  value={id}
                                  control={<Radio sx={{ display: 'none' }} />}
                                  sx={{ m: 0, width: '100%' }}
                                  label={renderItem(
                                    item,
                                    isSelected,
                                    isExpanded,
                                    (e) => handleToggleExpand(id, e),
                                    handleDeleteItem,
                                  )}
                                />
                              </Box>
                            </Grow>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  )}
                />
                {!!errors.selectedId?.message && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 2, display: 'block' }}
                  >
                    {errors.selectedId.message}
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Pagination — only shown in single-select / paginated mode */}
          {totalPages > 1 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mr: 1 }}
              >
                {startItem}–{endItem} of {totalCount}
              </Typography>
              <IconButton
                aria-label="Show First Page"
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
                aria-label="Show Previous Page"
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
                aria-label="Show Next Page"
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
                aria-label="Show Last Page"
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

          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={handleClose}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2.5,
                color: colors.textSecondary,
                '&:hover': { bgcolor: colors.surfaceHover },
              }}
            >
              Cancel
            </Button>

            {multiSelect ? (
              <Button
                variant="contained"
                onClick={onMultiSubmit}
                disabled={isLoading || multiSelectedIds.size === 0}
                startIcon={<CheckCircleIcon />}
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
                Add {multiSelectedIds.size} {itemLabel}
                {multiSelectedIds.size !== 1 ? 's' : ''}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || !selectedId}
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
                {triggerLabel}
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
