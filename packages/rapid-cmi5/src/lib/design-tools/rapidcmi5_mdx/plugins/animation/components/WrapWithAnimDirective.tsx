/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import React, { useCallback, useRef } from 'react';
import { Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { usePublisher, useCellValue, useCellValues } from '@mdxeditor/gurx';
import {
  activeEditor$,
  exportVisitors$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  syntaxExtensions$,
} from '@mdxeditor/editor';
import { type LexicalEditor } from 'lexical';
import { addAnimation$, slideAnimations$ } from '../state/animationCells';
import { DirectiveWrapper } from '../wrapping';

import { useLexicalSelection } from '../hooks/useLexicalSelection';
import { debugLog, EntranceEffect, AnimationTrigger } from '@rapid-cmi5/ui';

/**
 * Component to wrap selected content with an animation directive
 *
 * REFACTORED: Uses wrapSelectionOrBlock pattern
 * 1. Select content in the editor
 * 2. Click "Add Animation"
 * 3. Directive is created with auto-generated ID
 * 4. Animation config is added immediately (no markdown round-trip!)
 *
 * NEW: Direct Lexical node insertion using $createDirectiveNode
 * - No more insertMarkdown$ delays
 * - No more key resolution retries
 * - Immediate directive key available
 * - Much more reliable!
 */
export function WrapWithAnimDirective() {
  const addAnimation = usePublisher(addAnimation$);
  const animations = useCellValue(slideAnimations$);
  const activeEditor = useCellValue(activeEditor$);

  // Get MDXEditor configuration cells needed for exportMarkdownFromLexical
  const [
    exportVisitors,
    jsxComponentDescriptors,
    jsxIsAvailable,
    syntaxExtensions,
  ] = useCellValues(
    exportVisitors$,
    jsxComponentDescriptors$,
    jsxIsAvailable$,
    syntaxExtensions$,
  );

  // When the dialog opens, the editor can lose focus and `activeEditor$` may go null.
  // Cache the last known editor so "Create" still works while the dialog is focused.
  const lastActiveEditorRef = useRef<LexicalEditor | null>(null);
  if (activeEditor) {
    lastActiveEditorRef.current = activeEditor as LexicalEditor;
  }

  const { isAnimatable, selectedInfo } = useLexicalSelection();

  const handleWrap = useCallback(() => {
    // Early checks
    const editor =
      (activeEditor as LexicalEditor | null) ?? lastActiveEditorRef.current;
    if (!editor) {
      debugLog(
        '⛔ Editor not available (early return)',
        undefined,
        undefined,
        'wrap',
      );
      return;
    }
    if (!selectedInfo) {
      debugLog(
        '⛔ No selection info (early return)',
        undefined,
        undefined,
        'wrap',
      );
      return;
    }

    // Reuse existing directiveId for the selected node if present
    const existingForNode = animations.find(
      (a) => a.targetNodeKey === selectedInfo.nodeKey && a.directiveId,
    );

    const existingIds = new Set(
      animations.map((a) => a.directiveId).filter(Boolean) as string[],
    );
    const genId = () =>
      `anim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let animId = existingForNode?.directiveId ?? genId();
    while (existingIds.has(animId)) {
      animId = genId();
    }

    debugLog(
      '🟦 handleWrap invoked (auto ID)',
      {
        animId,
        hasActiveEditor: Boolean(activeEditor),
        hasLastEditor: Boolean(lastActiveEditorRef.current),
        hasExportVisitors: Boolean(exportVisitors),
        hasJsxComponentDescriptors: Boolean(jsxComponentDescriptors),
        hasJsxIsAvailable: jsxIsAvailable,
        hasSyntaxExtensions: Boolean(syntaxExtensions),
      },
      undefined,
      'wrap',
    );

    // Defensive check for required MDXEditor cells
    if (!exportVisitors || !jsxComponentDescriptors || !syntaxExtensions) {
      const missing = [];
      if (!exportVisitors) missing.push('exportVisitors');
      if (!jsxComponentDescriptors) missing.push('jsxComponentDescriptors');
      if (!syntaxExtensions) missing.push('syntaxExtensions');

      debugLog(
        '❌ Missing required MDXEditor cells:',
        missing,
        undefined,
        'wrap',
      );
      console.error('Missing required MDXEditor cells:', missing);
      return;
    }

    try {
      // Direct insertion using wrapSelection (not wrapSelectionToMarkdown!)
      const result = DirectiveWrapper.wrapSelection(
        editor,
        {
          directiveId: animId,
          validateNesting: true,
        },
        true, // drawer is open (we're in the component)
        exportVisitors,
        jsxComponentDescriptors,
        jsxIsAvailable ?? false,
        syntaxExtensions,
      );

      if (!result.success) {
        debugLog('❌ wrapSelection failed', result.error, undefined, 'wrap');
        console.error('Failed to wrap selection:', result.error);
        return;
      }

      debugLog(
        '✅ Directive inserted with key:',
        result.targetNodeKey,
        undefined,
        'wrap',
      );

      // NEW: targetNodeKey is available immediately!
      const targetNodeKey = result.targetNodeKey!;

      // RACE CONDITION FIX: Defer frontmatter update to next frame
      // This allows the Lexical transaction to complete and the directive to be
      // fully persisted before the frontmatter update triggers a re-render.
      // Without this, the frontmatter update causes React to re-render, which
      // causes MDXEditor to re-parse markdown, losing the just-inserted directive.
      requestAnimationFrame(() => {
        // Create animation config
        const newAnimation = {
          id: `anim_config_${Date.now()}`,
          order: 1, // Will be auto-adjusted by registry
          targetNodeKey, // Link to the directive node
          directiveId: animId, // Link to the directive
          targetLabel: selectedInfo?.label || 'Animation',
          entranceEffect: EntranceEffect.FADE_IN,
          trigger: AnimationTrigger.ON_SLIDE_OPEN,
          duration: 0.5,
          delay: 0,
          enabled: true,
        };

        debugLog(
          '🎬 Creating animation config (deferred):',
          newAnimation,
          undefined,
          'wrap',
        );
        addAnimation(newAnimation);

        debugLog(
          '✅ Animation created successfully',
          undefined,
          undefined,
          'wrap',
        );
      });
    } catch (err) {
      console.error('❌ Error wrapping with animation directive:', err);
    }
  }, [
    activeEditor,
    addAnimation,
    animations,
    selectedInfo,
    exportVisitors,
    jsxComponentDescriptors,
    jsxIsAvailable,
    syntaxExtensions,
  ]);

  return (
    <Button
      variant="outlined"
      startIcon={<AddCircleOutlineIcon />}
      onClick={handleWrap}
      fullWidth
      // Spacing is controlled by the parent drawer layout for consistent vertical rhythm
      sx={{ mb: 0 }}
      disabled={!isAnimatable}
    >
      Add Animation
    </Button>
  );
}
