import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import {
  slideAnimations$,
  playbackState$,
  playAllAnimations$,
  stopPlayback$,
  animationDrawerOpen$,
} from '../state/animationCells';
import {
  clearAnimationIndicators,
  updateAnimationIndicators,
} from '../utils/updateAnimationIndicators';
import { AnimationEngine, debugLog } from '@rapid-cmi5/ui';
import { PlaybackState } from '../types/Animation.types';

/**
 * Animation Preview Controls
 * Provides play/stop/reset controls for previewing animations in the editor
 */
export function AnimationPreview() {
  const animations = useCellValue(slideAnimations$);
  const playbackState = useCellValue(playbackState$);
  const isDrawerOpen = useCellValue(animationDrawerOpen$);
  const playAll = usePublisher(playAllAnimations$);
  const stop = usePublisher(stopPlayback$);

  const [isPlaying, setIsPlaying] = useState(false);
  const engineRef = useRef<AnimationEngine | null>(null);

  // Sync local playing state with Gurx playback state
  useEffect(() => {
    setIsPlaying(playbackState === PlaybackState.PLAYING);
  }, [playbackState]);

  // Reset state when drawer closes/opens
  useEffect(() => {
    if (!isDrawerOpen) {
      // Drawer closed - cleanup any running animations and restore elements
      debugLog(
        '🧹 Drawer closed, cleaning up preview state and restoring elements',
        undefined,
        undefined,
        'drawer',
      );
      if (engineRef.current) {
        engineRef.current.cleanup(); // Restore elements to normal state
        engineRef.current = null;
      }
      setIsPlaying(false);
      stop();

      // CRITICAL: Clear visual indicators (green borders, playing state)
      // This ensures no "playing" indicators remain after closing drawer
      clearAnimationIndicators();
      // Re-apply non-playing indicators
      setTimeout(() => updateAnimationIndicators(animations), 100);
    } else {
      // Drawer opened - ensure clean state
      debugLog(
        '✨ Drawer opened, preview ready',
        undefined,
        undefined,
        'drawer',
      );
    }
  }, [isDrawerOpen, stop, animations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup(); // Restore elements to normal state on unmount
      }
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (animations.length === 0) {
      console.warn('❌ No animations to play');
      return;
    }

    debugLog(
      `🎬 Starting animation preview with ${animations.length} animations:`,
      animations,
      undefined,
      'drawer',
    );

    // Log each animation's details for debugging
    animations.forEach((anim, index) => {
      debugLog(`🔍 [AnimationPreview] Animation ${index + 1}:`, {
        id: anim.id,
        directiveId: anim.directiveId,
        targetNodeKey: anim.targetNodeKey,
        targetLabel: anim.targetLabel,
        order: anim.order,
      });
    });

    // Create new engine instance
    const prefersReducedMotion = AnimationEngine.prefersReducedMotion();
    engineRef.current = new AnimationEngine(animations, {
      prefersReducedMotion,
      // B2: Resolve elements by directiveId (stable) when Lexical keys churn.
      // We keep key-based lookup as the fast-path for V1 and current-session matches.
      findElement: (targetNodeKey: string) => {
        // Fast-path: existing key-based selectors
        let el = document.querySelector<HTMLElement>(
          `[data-animation-id="${targetNodeKey}"]`,
        );
        if (el) return el;

        el = document.querySelector<HTMLElement>(
          `[data-animation-target="${targetNodeKey}"]`,
        );
        if (el) return el;

        el = document.querySelector<HTMLElement>(
          `[data-lexical-key="${targetNodeKey}"]`,
        );
        if (el) return el;

        // Fallback: if this animation is directive-based, resolve via stable directive id
        const anim = animations.find((a) => a.targetNodeKey === targetNodeKey);
        if (anim?.directiveId) {
          el = document.querySelector<HTMLElement>(
            `[data-anim-directive-id="${anim.directiveId}"]`,
          );
          if (el) return el;
        }

        return null;
      },
      onAnimationStart: (id) => {
        const anim = animations.find((a) => a.id === id);
        debugLog('▶️ Animation started:', { id, anim }, undefined, 'drawer');
      },
      onAnimationComplete: (id) => {
        const anim = animations.find((a) => a.id === id);
        debugLog('✅ Animation completed:', { id, anim }, undefined, 'drawer');
      },
      onAllComplete: () => {
        debugLog('🎉 All animations completed', undefined, undefined, 'drawer');
        setIsPlaying(false);
        // IMPORTANT: Remove animation classes/styles after preview completes.
        // Otherwise, if the editor DOM re-renders (e.g., switching to markdown view and back),
        // CSS animations can replay automatically because elements mount with anim-* classes.
        if (engineRef.current) {
          engineRef.current.cleanup();
          engineRef.current = null;
        }
        // Reset Gurx playback state back to IDLE
        stop();
      },
    });

    // Start playback
    setIsPlaying(true);
    playAll();

    debugLog(
      '🚀 Calling engineRef.current.playAll()...',
      undefined,
      undefined,
      'preview',
    );
    engineRef.current
      .playAll()
      .then(() => {
        debugLog(
          '✅ playAll() completed successfully',
          undefined,
          undefined,
          'preview',
        );
      })
      .catch((error) => {
        console.error('❌ Animation playback error:', error);
        setIsPlaying(false);
      });
  }, [animations, playAll]);

  const handleStop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsPlaying(false);
    stop();
  }, [stop]);

  const handleReset = useCallback(() => {
    debugLog(
      '🔄 Reset button clicked - cleaning up and restoring elements',
      undefined,
      undefined,
      'drawer',
    );
    if (engineRef.current) {
      engineRef.current.cleanup(); // Use cleanup() instead of reset() to restore elements to normal state
    }
    setIsPlaying(false);
    stop();

    // Clear and restore animation indicators
    clearAnimationIndicators();
    setTimeout(() => updateAnimationIndicators(animations), 100);
  }, [stop, animations]);

  const hasAnimations = animations.length > 0;
  const enabledAnimations = animations.filter((a) => a.enabled);
  const hasEnabledAnimations = enabledAnimations.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 1,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1}>
        <Tooltip
          title={
            !hasAnimations
              ? 'No animations'
              : !hasEnabledAnimations
                ? 'No enabled animations'
                : 'Play animations'
          }
        >
          <span>
            <IconButton
              size="small"
              onClick={handlePlay}
              disabled={!hasEnabledAnimations || isPlaying}
              color="primary"
            >
              <PlayArrowIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Stop playback">
          <span>
            <IconButton
              size="small"
              onClick={handleStop}
              disabled={!isPlaying}
              color="error"
            >
              <StopIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Reset animations">
          <span>
            <IconButton
              size="small"
              onClick={handleReset}
              disabled={!hasAnimations}
              color="default"
            >
              <RestartAltIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {hasAnimations && (
        <Box sx={{ ml: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          {enabledAnimations.length} of {animations.length} enabled
        </Box>
      )}
    </Box>
  );
}
