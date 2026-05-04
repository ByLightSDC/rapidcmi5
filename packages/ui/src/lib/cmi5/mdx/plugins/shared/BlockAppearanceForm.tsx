import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * The sentinel value meaning "inherit from lesson theme" (no block-level override).
 * Stored as undefined on the directive attribute; this local constant is only used
 * inside the form for the toggle state.
 */
export const BLOCK_WIDTH_INHERIT = 'inherit' as const;
export type BlockWidthValue = ContentWidthEnum | typeof BLOCK_WIDTH_INHERIT;

const descriptions: Record<BlockWidthValue, string> = {
  [BLOCK_WIDTH_INHERIT]: 'Use lesson-level content width setting',
  [ContentWidthEnum.None]: 'No width constraint (full editor width)',
  [ContentWidthEnum.Small]: 'Narrow content area (55% of available width)',
  [ContentWidthEnum.Medium]: 'Standard content area (75% of available width)',
  [ContentWidthEnum.Large]: 'Full width content area',
};

interface BlockAppearanceFormProps {
  open: boolean;
  /** Current block-level contentWidth attribute value, or undefined when inheriting. */
  currentContentWidth: ContentWidthEnum | undefined;
  onClose: () => void;
  onSave: (contentWidth: ContentWidthEnum | undefined) => void;
}

/**
 * Lightweight dialog for overriding content width at the block level.
 * Used by Tabs, Accordion, Grid, and Admonitions editors.
 *
 * Selecting "Lesson" clears the block override and inherits from the lesson theme.
 * Selecting None/S/M/L sets an explicit block-level width that overrides the lesson.
 */
export const BlockAppearanceForm: React.FC<BlockAppearanceFormProps> = ({
  open,
  currentContentWidth,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState<BlockWidthValue>(
    currentContentWidth ?? BLOCK_WIDTH_INHERIT,
  );

  // Reset local state when the dialog opens so it always reflects the current attribute.
  React.useEffect(() => {
    if (open) {
      setValue(currentContentWidth ?? BLOCK_WIDTH_INHERIT);
    }
  }, [open, currentContentWidth]);

  const handleSave = () => {
    onSave(value === BLOCK_WIDTH_INHERIT ? undefined : value);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Block Appearance</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Content Width
          </Typography>
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, val: BlockWidthValue | null) => {
              if (val !== null) setValue(val);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={BLOCK_WIDTH_INHERIT}>Lesson</ToggleButton>
            <ToggleButton value={ContentWidthEnum.None}>None</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Small}>S</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Medium}>M</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Large}>L</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {descriptions[value]}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" size="small">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};
