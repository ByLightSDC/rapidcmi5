/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import { activeEditor$, insertMarkdown$ } from '@mdxeditor/editor';
import {
  $createRangeSelection,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  type LexicalEditor,
} from 'lexical';
import { addAnimation$ } from '../state/animationCells';
import { DirectiveWrapper } from '../wrapping';
import { addAnimationIdsToElements } from '../utils/lexicalDomBridge';
import { debugWrap } from '../utils/debug';
import { useLexicalSelection } from '../hooks/useLexicalSelection';
import { debugLog } from '@rapid-cmi5/ui';
import { AnimationTrigger, EntranceEffect } from '../types/Animation.types';

/**
 * Component to wrap selected content with an animation directive
 *
 * Phase 5: Dialog-based naming for directive creation
 * 1. Select content in the editor
 * 2. Click "Add Animation"
 * 3. Dialog opens to name the animation directive
 * 4. Directive is created with the user-provided ID
 */
export function WrapWithAnimDirective() {
  const insertionAnchorRef = useRef<{
    parentKey: string;
    index: number;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [directiveId, setDirectiveId] = useState('');

  const addAnimation = usePublisher(addAnimation$);
  const activeEditor = useCellValue(activeEditor$);
  // When the dialog opens, the editor can lose focus and `activeEditor$` may go null.
  // Cache the last known editor so "Create" still works while the dialog is focused.
  const lastActiveEditorRef = useRef<LexicalEditor | null>(null);
  if (activeEditor) {
    lastActiveEditorRef.current = activeEditor as LexicalEditor;
  }
  const insertMarkdown = usePublisher(insertMarkdown$);
  const { isAnimatable } = useLexicalSelection();

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
    setDirectiveId(''); // Reset ID field
  }, []);

  const handleCloseDialog = useCallback(() => {
    debugWrap.log('🧼 Closing dialog (handleCloseDialog)');
    setDialogOpen(false);
    setDirectiveId('');
  }, []);

  const handleWrap = useCallback(() => {
    const animId = directiveId.trim();

    debugWrap.log('🟦 handleWrap invoked', {
      dialogOpen,
      directiveId,
      animId,
      hasActiveEditor: Boolean(activeEditor),
      hasLastEditor: Boolean(lastActiveEditorRef.current),
    });

    // Always close dialog, even on validation failures
    try {
      if (!animId) {
        debugWrap.warn('⛔ Animation ID is required (early return)');
        return;
      }

      // Validate ID format (alphanumeric, underscores, hyphens)
      if (!/^[a-zA-Z0-9_-]+$/.test(animId)) {
        debugWrap.warn('⛔ Invalid ID format (early return)', animId);
        return;
      }

      const editor =
        (activeEditor as LexicalEditor | null) ?? lastActiveEditorRef.current;
      if (!editor) {
        debugWrap.error('⛔ Editor not available (early return)');
        return;
      }
      debugLog(
        '🚀 Phase 5: Wrapping with user-provided ID',
        animId,
        undefined,
        'wrap',
      );
      debugWrap.log('🎬 handleWrap start with animId', animId);

      const result = DirectiveWrapper.wrapSelectionToMarkdown(
        editor,
        {
          directiveId: animId,
          validateNesting: true,
        },
        true, // drawer is open (we're in the component)
      );

      if (!result.success) {
        debugWrap.warn('❌ wrapSelectionToMarkdown failed', result.error);
        console.error('Failed to wrap selection:', result.error);
        return;
      }

      debugWrap.log('✅ Generated wrapped markdown:', result.markdown);

      // Delete selection (range or decorator) and position caret where we will insert
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          selection.removeText();
          const anchor = selection.anchor.getNode();
          const parent = anchor.getParent();
          if (parent) {
            insertionAnchorRef.current = {
              parentKey: parent.getKey(),
              index: anchor.getIndexWithinParent(),
            };
            debugWrap.log(
              '🧭 Range selection anchor',
              insertionAnchorRef.current,
            );
          }
          return;
        }

        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          if (nodes.length > 0) {
            const node = nodes[0];
            const parent = node.getParent();
            const index = node.getIndexWithinParent();

            node.remove();

            if (parent) {
              insertionAnchorRef.current = {
                parentKey: parent.getKey(),
                index,
              };
              debugWrap.log(
                '🧭 Node selection anchor',
                insertionAnchorRef.current,
              );
              const range = $createRangeSelection();
              range.anchor.set(parent.getKey(), index, 'element');
              range.focus.set(parent.getKey(), index, 'element');
              $setSelection(range);
            }
          }
        }
      });

      // Ensure a valid selection exists at the intended insertion point
      editor.update(() => {
        const anchor = insertionAnchorRef.current;
        if (anchor) {
          const range = $createRangeSelection();
          range.anchor.set(anchor.parentKey, anchor.index, 'element');
          range.focus.set(anchor.parentKey, anchor.index, 'element');
          $setSelection(range);
          debugWrap.log('📌 Restored selection at anchor', anchor);
        }
      });

      // Insert the wrapped content (must be after delete completes)
      insertMarkdown(result.markdown);

      debugLog('📝 Inserted wrapped content', undefined, undefined, 'wrap');
      debugWrap.log('📝 Inserted wrapped content');

      // Wait a tick for the directive to be inserted, then find its key
      setTimeout(() => {
        // Tag all elements (including the newly inserted directive) so we can find its key
        addAnimationIdsToElements(editor);
        debugWrap.log('🔖 Retagged elements after insert');

        const resolveTargetKey = () =>
          DirectiveWrapper.findInsertedDirectiveKey(editor, animId) || 'temp';

        const finalizeAnimation = (targetNodeKey: string) => {
          debugWrap.log('🔑 Found directive node key:', targetNodeKey);

          const newAnimation = {
            id: `anim_config_${Date.now()}`,
            order: 1, // Will be auto-adjusted by registry
            targetNodeKey, // Link to the directive node
            directiveId: animId, // Link to the directive
            targetLabel: `Animation: ${animId}`,
            entranceEffect: EntranceEffect.FADE_IN,
            trigger: AnimationTrigger.ON_SLIDE_OPEN,
            duration: 0.5,
            delay: 0,
            enabled: true,
          };

          debugLog(
            '🎬 Creating animation config:',
            newAnimation,
            undefined,
            'wrap',
          );
          addAnimation(newAnimation);
        };

        let targetNodeKey = resolveTargetKey();

        if (targetNodeKey === 'temp') {
          setTimeout(() => {
            addAnimationIdsToElements(editor);
            debugWrap.warn('⏳ Retrying directive key resolution');
            targetNodeKey = resolveTargetKey();
            if (targetNodeKey === 'temp') {
              debugWrap.error(
                '❌ Could not resolve directive node key after retry. Aborting animation creation.',
              );
              console.error(
                'Could not resolve inserted directive. Please try again.',
              );
              return;
            }
            finalizeAnimation(targetNodeKey);
          }, 150);
        } else {
          finalizeAnimation(targetNodeKey);
        }
      }, 100);
    } catch (err) {
      console.error('❌ Error wrapping with animation directive:', err);
      debugWrap.error('❌ handleWrap caught error', err);
    } finally {
      debugWrap.log('🟩 handleWrap finally: closing dialog');
      handleCloseDialog();
    }
  }, [
    addAnimation,
    activeEditor,
    insertMarkdown,
    directiveId,
    handleCloseDialog,
    dialogOpen,
  ]);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleOpenDialog}
        fullWidth
        // Spacing is controlled by the parent drawer layout for consistent vertical rhythm
        sx={{ mb: 0 }}
        disabled={!isAnimatable}
      >
        Add Animation
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (directiveId.trim()) {
              handleWrap();
            }
          }}
        >
          <DialogTitle>Name Animation Directive</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Animation ID"
              type="text"
              fullWidth
              value={directiveId}
              onChange={(e) => setDirectiveId(e.target.value)}
              helperText="Use letters, numbers, underscores, and hyphens only"
              placeholder="e.g., fadeIn_hero, slideIn_1"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!directiveId.trim()}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
