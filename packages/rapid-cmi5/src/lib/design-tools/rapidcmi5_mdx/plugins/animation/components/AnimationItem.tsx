import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Stack,
  Typography,
  IconButton,
  Paper,
  TextField,
  Collapse,
  Box,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import { selectedAnimation$, updateAnimation$ } from '../state/animationCells';
import { AnimationConfig, EntranceEffect, ExitEffect, AnimationTrigger, SelectorMainUi } from '@rapid-cmi5/ui';


interface Props {
  animation: AnimationConfig;
}

export function AnimationItem({ animation }: Props) {
  const updateAnim = usePublisher(updateAnimation$);
  const selectedId = useCellValue(selectedAnimation$);
  const selectAnimation = usePublisher(selectedAnimation$);
  const isSelected = selectedId === animation.id;

  // Ref for scrolling into view when selected
  const itemRef = useRef<HTMLDivElement>(null);

  // Auto-expand when selected, but allow manual control
  const [isExpanded, setIsExpanded] = useState(isSelected);

  // Auto-expand when selection changes from not selected -> selected
  // Auto-collapse when selection changes from selected -> not selected (with debounce)
  const wasSelectedRef = useRef(isSelected);
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wasSelected = wasSelectedRef.current;

    if (isSelected && !wasSelected) {
      // Cancel any pending collapse - selection was restored
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }

      // Expand the item when it becomes selected
      if (!isExpanded) {
        setIsExpanded(true);
      }

      // Scroll into view with smooth animation
      if (itemRef.current) {
        setTimeout(() => {
          itemRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }, 100); // Small delay to allow expansion animation to start
      }
    } else if (!isSelected && wasSelected) {
      // Debounce collapse to allow for selection restoration during markdown re-parse
      collapseTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
        collapseTimeoutRef.current = null;
      }, 50); // Short debounce to allow selection restore to cancel
    }
    wasSelectedRef.current = isSelected;

    // Cleanup timeout on unmount
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, [isSelected, isExpanded, selectedId, animation.id]);

  const handleEntranceChange = useCallback(
    (value: string) => {
      console.log('🎬 Entrance effect change:', value);
      updateAnim({
        id: animation.id,
        updates: { entranceEffect: value as EntranceEffect },
      });
    },
    [updateAnim, animation.id],
  );

  const handleExitChange = useCallback(
    (value: string) => {
      updateAnim({
        id: animation.id,
        updates: { exitEffect: value as ExitEffect },
      });
    },
    [updateAnim, animation.id],
  );

  const handleTriggerChange = useCallback(
    (value: string) => {
      updateAnim({
        id: animation.id,
        updates: { trigger: value as AnimationTrigger },
      });
    },
    [updateAnim, animation.id],
  );

  const handleDurationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('⏱️ Duration change event:', event.target.value);
      const value = parseFloat(event.target.value);
      if (!isNaN(value) && value >= 0.1 && value <= 10) {
        console.log('⏱️ Updating duration to:', value);
        updateAnim({
          id: animation.id,
          updates: { duration: value },
        });
      }
    },
    [updateAnim, animation.id],
  );

  const handleDelayChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value);
      if (!isNaN(value) && value >= 0 && value <= 10) {
        updateAnim({
          id: animation.id,
          updates: { delay: value },
        });
      }
    },
    [updateAnim, animation.id],
  );

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
    // Select this animation when expanding
    if (!isSelected) {
      selectAnimation(animation.id);
    }
  }, [isSelected, selectAnimation, animation.id]);

  // Prevent Lexical key handlers (tab/enter) from firing when typing in fields
  const handleFieldKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.stopPropagation();
    }
  }, []);

  // Catch-all for any child control inside the expanded panel
  const handleControlsKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.stopPropagation();
    }
  }, []);

  // Keep select menus above the high-zindex drawer paper so they stay clickable
  const selectMenuProps = useMemo(
    () => ({
      MenuProps: {
        disablePortal: true,
        PaperProps: {
          sx: { zIndex: 1700 },
        },
      },
    }),
    [],
  );

  // Get primary effect to display in summary
  const primaryEffect =
    animation.entranceEffect && animation.entranceEffect !== EntranceEffect.NONE
      ? animation.entranceEffect
      : animation.exitEffect && animation.exitEffect !== ExitEffect.NONE
        ? animation.exitEffect
        : 'None';

  // UX: always show a simple label; targetLabel still kept in data/markdown.
  const displayLabel = 'Animation';

  return (
    <Paper
      ref={itemRef}
      data-animation-id={animation.id}
      elevation={isSelected ? 3 : 1}
      sx={{
        marginBottom: 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderWidth: 1,
        borderStyle: 'solid',
        transition: 'all 0.2s ease',
        '&:hover': {
          elevation: 2,
          borderColor: 'primary.light',
        },
      }}
    >
      <Stack direction="column">
        {/* Compact Header - Always Visible */}
        <Box
          onClick={handleToggleExpand}
          sx={{
            padding: 1.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {animation.order}. {displayLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {primaryEffect} • {animation.trigger}
            </Typography>
          </Box>
        </Box>

        {/* Expandable Controls */}
        <Collapse in={isExpanded}>
          <Box
            sx={{ padding: 1.5, paddingTop: 0 }}
            onKeyDown={handleControlsKeyDown}
          >
            <Stack direction="column" spacing={1}>
              {/* Entrance Effect Selector */}
              <Typography variant="caption">Entrance</Typography>
              <SelectorMainUi
                value={animation.entranceEffect || EntranceEffect.NONE}
                options={Object.values(EntranceEffect)}
                onSelect={handleEntranceChange}
                onKeyDown={handleFieldKeyDown}
                SelectProps={selectMenuProps}
                listItemProps={{
                  textTransform: 'capitalize',
                }}
                readOnly={false}
                isTransient={true}
              />

              {/* Exit Effect Selector */}
              <Typography variant="caption">Exit</Typography>
              <SelectorMainUi
                value={animation.exitEffect || ExitEffect.NONE}
                options={Object.values(ExitEffect)}
                onSelect={handleExitChange}
                onKeyDown={handleFieldKeyDown}
                SelectProps={selectMenuProps}
                listItemProps={{
                  textTransform: 'capitalize',
                }}
                readOnly={false}
                isTransient={true}
              />

              {/* Trigger Selector */}
              <Typography variant="caption">Trigger</Typography>
              <SelectorMainUi
                value={animation.trigger}
                options={Object.values(AnimationTrigger)}
                onSelect={handleTriggerChange}
                onKeyDown={handleFieldKeyDown}
                SelectProps={selectMenuProps}
                listItemProps={{
                  textTransform: 'none',
                }}
                readOnly={false}
                isTransient={true}
              />

              {/* Duration and Delay */}
              <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                <TextField
                  label="Duration (s)"
                  type="number"
                  size="small"
                  value={animation.duration}
                  onChange={handleDurationChange}
                  onKeyDown={handleFieldKeyDown}
                  inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Delay (s)"
                  type="number"
                  size="small"
                  value={animation.delay}
                  onChange={handleDelayChange}
                  onKeyDown={handleFieldKeyDown}
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
}
