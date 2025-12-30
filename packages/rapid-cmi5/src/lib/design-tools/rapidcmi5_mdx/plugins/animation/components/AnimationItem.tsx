import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Typography,
  IconButton,
  Paper,
  TextField,
  Collapse,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import {
  deleteAnimation$,
  selectedAnimation$,
  updateAnimation$,
  slideAnimations$,
  getMarkdownFn$,
  setMarkdownFn$,
} from '../state/animationCells';

import { activeEditor$ } from '@mdxeditor/editor';
import { debugWrap } from '../utils/debug';
import { DirectiveWrapper } from '../wrapping';
import { AnimationConfig, AnimationTrigger, EntranceEffect, ExitEffect, SelectorMainUi } from '@rapid-cmi5/ui';

interface Props {
  animation: AnimationConfig;
}

export function AnimationItem({ animation }: Props) {
  const deleteAnim = usePublisher(deleteAnimation$);
  const updateAnim = usePublisher(updateAnimation$);
  const selectedId = useCellValue(selectedAnimation$);
  const selectAnimation = usePublisher(selectedAnimation$);
  const editor = useCellValue(activeEditor$);
  const animations = useCellValue(slideAnimations$);
  const getMarkdown = useCellValue(getMarkdownFn$);
  const setMarkdown = useCellValue(setMarkdownFn$);
  const isSelected = selectedId === animation.id;

  // Auto-expand when selected, but allow manual control
  const [isExpanded, setIsExpanded] = useState(isSelected);

  // COMMENTED OUT: Local state for editing the directive ID
  // Renaming at runtime causes race conditions - ID should only be set at creation
  // const [editingDirectiveId, setEditingDirectiveId] = useState(animation.directiveId || '');

  // Auto-expand when selected, but don't auto-collapse (user may be editing)
  useEffect(() => {
    if (isSelected && !isExpanded) {
      // Only auto-expand when becoming selected
      setIsExpanded(true);
    }
    // Don't auto-collapse when deselected - let user manually collapse
  }, [isSelected, isExpanded]);

  // COMMENTED OUT: Sync local editing state when animation.directiveId changes
  // useEffect(() => {
  //   setEditingDirectiveId(animation.directiveId || '');
  // }, [animation.directiveId]);

  const handleDelete = useCallback(() => {
    // If this is the last animation tied to a directive, unwrap the directive block
    if (editor && animation.directiveId && getMarkdown && setMarkdown) {
      const remainingForDirective = animations.filter(
        (a) => a.directiveId === animation.directiveId,
      );
      if (remainingForDirective.length <= 1) {
        debugWrap.log(
          '🗑️ Delete requested for last anim on directive',
          animation.directiveId,
        );
        const unwrapped = DirectiveWrapper.unwrapDirectiveById(
          editor,
          animation.directiveId,
          getMarkdown,
          setMarkdown,
        );
        if (unwrapped) {
          debugWrap.log(
            '🧹 Unwrapped anim directive after delete',
            animation.directiveId,
          );

          // Defer animation deletion to allow unwrap's setMarkdown to complete
          // This prevents a race condition where onAnimationsChange reads stale markdown
          setTimeout(() => {
            deleteAnim(animation.id);
          }, 50);
          return;
        } else {
          debugWrap.warn(
            '⚠️ Could not find anim directive to unwrap after delete',
            animation.directiveId,
          );
        }
      } else {
        debugWrap.log(
          'ℹ️ Directive has other animations, not unwrapping',
          animation.directiveId,
        );
      }
    }

    // Delete animation immediately if no unwrap was needed
    deleteAnim(animation.id);
  }, [
    deleteAnim,
    animation.id,
    animation.directiveId,
    editor,
    animations,
    getMarkdown,
    setMarkdown,
  ]);

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

  // COMMENTED OUT: handleDirectiveIdChange - causes race conditions with markdown re-parsing
  // Users should set the ID at creation time via the dialog, or edit in markdown directly
  /*
  const handleDirectiveIdChange = useCallback(
    (newId: string) => {
      const trimmedId = newId.trim();

      debugLog('🔄 [AnimationItem] handleDirectiveIdChange called', {
        oldId: animation.directiveId,
        newId: trimmedId,
        animationConfigId: animation.id,
      }, undefined, 'drawer');

      // Validate ID format (alphanumeric, underscores, hyphens)
      if (trimmedId && !/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
        console.warn('Invalid ID format. Use only letters, numbers, underscores, and hyphens');
        return;
      }

      if (!trimmedId || !animation.directiveId || trimmedId === animation.directiveId) {
        debugLog('🔄 [AnimationItem] Skipping update (empty or same ID)', undefined, undefined, 'drawer');
        return;
      }

      // Update the directive ID in the markdown
      if (editor && getMarkdown && setMarkdown) {
        debugLog('🔄 [AnimationItem] Step 1: Updating directive ID in markdown', undefined, undefined, 'drawer');
        const success = DirectiveWrapper.updateDirectiveId(
          animation.directiveId,
          trimmedId,
          getMarkdown,
          setMarkdown,
        );

        if (success) {
          console.log('✅ [AnimationItem] Step 1 complete: Directive ID updated in markdown');

          // Small delay to let markdown re-parse before updating animation config
          setTimeout(() => {
            debugLog('🔄 [AnimationItem] Step 2: Finding new node key for renamed directive', undefined, undefined, 'drawer');

            // Find the new node key for the renamed directive
            const newNodeKey = DirectiveWrapper.findInsertedDirectiveKey(editor, trimmedId);

            if (newNodeKey) {
              console.log('✅ [AnimationItem] Found new node key:', newNodeKey);

              // Update the animation config with both the new directive ID and new node key
              updateAnim({
                id: animation.id,
                updates: {
                  directiveId: trimmedId,
                  targetNodeKey: newNodeKey,
                  targetLabel: `Animation: ${trimmedId}`,
                },
              });
              debugLog('✅ [AnimationItem] Step 2 complete: Animation config updated with new node key', undefined, undefined, 'drawer');
            } else {
              console.error('❌ [AnimationItem] Could not find new node key for directive:', trimmedId);
              // Still update the directiveId even if we can't find the key
              updateAnim({
                id: animation.id,
                updates: {
                  directiveId: trimmedId,
                  targetLabel: `Animation: ${trimmedId}`,
                },
              });
            }
          }, 150); // Increased delay to ensure re-parse completes
        } else {
          console.error('❌ [AnimationItem] Failed to update directive ID in markdown');
        }
      }
    },
    [animation.id, animation.directiveId, editor, getMarkdown, setMarkdown, updateAnim],
  );
  */

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

  return (
    <Paper
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
              {animation.order}. {animation.targetLabel || 'Element'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {primaryEffect} • {animation.trigger}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label="Delete animation"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Expandable Controls */}
        <Collapse in={isExpanded}>
          <Box
            sx={{ padding: 1.5, paddingTop: 0 }}
            onKeyDown={handleControlsKeyDown}
          >
            <Stack direction="column" spacing={1}>
              {/* COMMENTED OUT: Animation ID Field - Editable
                  Renaming at runtime causes race conditions - ID should only be set at creation
              {animation.directiveId && (
                <>
                  <Typography variant="caption" sx={{ marginTop: 1 }}>
                    Animation ID
                  </Typography>
                  <TextField
                    size="small"
                    value={editingDirectiveId}
                    onChange={(e) => setEditingDirectiveId(e.target.value)}
                    onBlur={(e) => handleDirectiveIdChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        handleDirectiveIdChange(target.value);
                      }
                    }}
                    helperText="Press Enter or blur to save"
                    sx={{ flex: 1 }}
                  />
                </>
              )}
              */}

              {/* COMMENTED OUT: Animation ID Field - Read-only display
              {animation.directiveId && (
                <>
                  <Typography variant="caption" sx={{ marginTop: 1 }}>
                    Animation ID (set at creation)
                  </Typography>
                  <Typography variant="body2" sx={{
                    padding: 1,
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                  }}>
                    {animation.directiveId}
                  </Typography>
                </>
              )}
              */}

              {/* Entrance Effect Selector */}
              <Typography variant="caption">Entrance</Typography>
              <SelectorMainUi
                defaultValue={animation.entranceEffect || EntranceEffect.NONE}
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
                defaultValue={animation.exitEffect || ExitEffect.NONE}
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
                defaultValue={animation.trigger}
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
