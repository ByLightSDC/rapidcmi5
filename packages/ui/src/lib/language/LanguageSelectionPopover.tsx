import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Popover,
  Box,
  TextField,
  Button,
  Stack,
  List,
  ListItemButton,
  Typography,
} from '@mui/material';
import {
  COMMON_LANGUAGES,
  isValidLanguageTag,
  labelForLanguageTag,
} from '../cmi5/mdx/constants/languages';

export type LanguageSelectionPopoverProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  /** The language tag currently applied to the selection, if any. */
  currentTag?: string | null;
  /** Called with a valid BCP 47 tag when the author confirms a language. */
  onPickLanguage: (tag: string) => void;
  /** Called when the author removes the language wrapping. */
  onClear: () => void;
  widthPx?: number;
};

/**
 * Searchable language picker for the "Language of Parts" (WCAG SC 3.1.2)
 * feature. Presents a curated list of common BCP 47 languages and also accepts
 * free-text entry for uncommon tags (e.g. `es-MX`, `zh-Hant`).
 *
 * The list renders inline inside the popover (rather than in a floating
 * Autocomplete dropdown) so the whole control stays self-contained.
 */
export function LanguageSelectionPopover({
  anchorEl,
  onClose,
  currentTag,
  onPickLanguage,
  onClear,
  widthPx = 300,
}: LanguageSelectionPopoverProps) {
  const open = Boolean(anchorEl);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Seed / reset the search field each time the popover opens.
  useEffect(() => {
    if (!open) return;
    setQuery(currentTag ? labelForLanguageTag(currentTag) : '');
    // Focus after the popover has mounted.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open, currentTag]);

  const trimmed = query.trim();

  // Filter the curated list by label or tag (case-insensitive).
  const filtered = useMemo(() => {
    if (!trimmed) return COMMON_LANGUAGES;
    const q = trimmed.toLowerCase();
    return COMMON_LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q),
    );
  }, [trimmed]);

  // Resolve the free-text field to a tag: an exact label/tag match wins,
  // otherwise treat the raw input as a tag (supports uncommon tags like es-MX).
  const resolvedTag = useMemo(() => {
    if (!trimmed) return '';
    const match = COMMON_LANGUAGES.find(
      (l) =>
        l.label.toLowerCase() === trimmed.toLowerCase() ||
        l.tag.toLowerCase() === trimmed.toLowerCase(),
    );
    return match ? match.tag : trimmed;
  }, [trimmed]);

  const canApply = Boolean(resolvedTag) && isValidLanguageTag(resolvedTag);

  const applyTag = (tag: string) => {
    onPickLanguage(tag);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ p: 1.5, width: widthPx }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          label="Language"
          placeholder="Search or type a tag (e.g. es-MX)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canApply) {
              e.preventDefault();
              applyTag(resolvedTag);
            }
          }}
        />

        <List
          dense
          sx={{
            mt: 1,
            maxHeight: 240,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            py: 0,
          }}
        >
          {filtered.length === 0 && (
            <Box sx={{ p: 1.5, opacity: 0.6, fontSize: 13 }}>
              No match — press Apply to use "{trimmed}" as a tag.
            </Box>
          )}
          {filtered.map((l) => (
            <ListItemButton
              key={l.tag}
              // Highlight the row matching what's resolved from the field so the
              // user sees their choice; clicking fills the field (does not
              // apply) — Apply/Enter commits.
              selected={resolvedTag.toLowerCase() === l.tag.toLowerCase()}
              onClick={() => setQuery(l.label)}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <span>{l.label}</span>
                <Typography variant="caption" sx={{ opacity: 0.6, ml: 2 }}>
                  {l.tag}
                </Typography>
              </Stack>
            </ListItemButton>
          ))}
        </List>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          <Button
            size="small"
            color="inherit"
            disabled={!currentTag}
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            Remove
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={!canApply}
            onClick={() => applyTag(resolvedTag)}
          >
            Apply
          </Button>
        </Stack>

        {currentTag && (
          <Box sx={{ mt: 1, fontSize: 12, opacity: 0.7 }}>
            Currently: {labelForLanguageTag(currentTag)}
          </Box>
        )}
      </Box>
    </Popover>
  );
}
