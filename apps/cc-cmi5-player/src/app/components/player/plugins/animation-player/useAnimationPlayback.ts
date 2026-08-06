import { AnimationConfig, AnimationEngine } from '@rapid-cmi5/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook for playing animations in the CMI5 player
 * Auto-plays animations when slide loads
 */
export function useAnimationPlayback(
  animations: AnimationConfig[],
  slideIndex: number,
  enabled: boolean = true,
) {
  const engineRef = useRef<AnimationEngine | null>(null);

  // Drives the play/pause control. `hasAnimations` lets the UI disable the
  // control on slides with nothing to pause (WCAG 2.2.2 only applies when
  // there is moving content).
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const hasAnimations = Boolean(enabled && animations && animations.length > 0);

  useEffect(() => {
    // New slide (or new content): start from a clean, un-paused state.
    setIsPaused(false);
    setIsComplete(false);
  }, [animations, slideIndex]);

  useEffect(() => {
    // Skip if animations disabled or no animations
    if (!enabled || !animations || animations.length === 0) {
      return;
    }

    console.log(
      '🎬 Auto-playing',
      animations.length,
      'animations for slide',
      slideIndex,
    );

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Custom element finder for player.
    //
    // V2 (directive-based): prefer directiveId → [data-anim-directive-id="..."]
    // V1 (stableId-based): fall back to [data-stable-id="..."] and text heuristics
    const findElementByStableId = (
      targetNodeKey: string,
    ): HTMLElement | null => {
      // First, try to find the animation config with this targetNodeKey
      const animation = animations.find(
        (a) => a.targetNodeKey === targetNodeKey,
      );

      // V2: directiveId is the stable identifier. Player DOM gets data-anim-directive-id
      // from AnimDirectiveDescriptor.
      if (animation?.directiveId) {
        const el = document.querySelector<HTMLElement>(
          `[data-anim-directive-id="${animation.directiveId}"]`,
        );
        if (el) {
          return el;
        }
        console.warn(
          '❌ Could not find element for directiveId:',
          animation.directiveId,
          'targetNodeKey:',
          targetNodeKey,
        );
      }

      if (animation?.stableId) {
        console.log(
          '🔍 Looking for element with stableId:',
          animation.stableId,
        );

        // Try to find by data attribute (if set by editor)
        let element = document.querySelector<HTMLElement>(
          `[data-stable-id="${animation.stableId}"]`,
        );

        if (!element) {
          // Fallback: find by text content for headings/paragraphs
          const editorRoot = document.querySelector(
            '.mdxeditor-root-contenteditable',
          );
          if (editorRoot && animation.targetLabel) {
            // Extract just the text after the type prefix (e.g., "Toc-heading: Animated Header" -> "Animated Header")
            const labelParts = animation.targetLabel.split(':');
            const searchText =
              labelParts.length > 1
                ? labelParts[1].trim()
                : animation.targetLabel;

            console.log('🔍 Searching for text:', searchText);

            // Search in headings first
            const headings = Array.from(
              editorRoot.querySelectorAll('h1, h2, h3, h4, h5, h6'),
            );
            for (const heading of headings) {
              if (heading.textContent?.trim() === searchText) {
                console.log('✅ Found element by heading text:', heading);
                element = heading as HTMLElement;
                break;
              }
            }

            // If not found in headings, try paragraphs
            if (!element) {
              const paragraphs = Array.from(editorRoot.querySelectorAll('p'));
              for (const p of paragraphs) {
                if (p.textContent?.trim().includes(searchText)) {
                  console.log('✅ Found element by paragraph text:', p);
                  element = p as HTMLElement;
                  break;
                }
              }
            }

            // If not found in paragraphs, try images
            if (!element) {
              const images = Array.from(editorRoot.querySelectorAll('img'));
              for (const img of images) {
                const src = img.getAttribute('src') || '';
                const alt = img.getAttribute('alt') || '';
                // Match by filename in src or alt text
                if (src.includes(searchText) || alt.includes(searchText)) {
                  console.log('✅ Found element by image src/alt:', img);
                  element = img as HTMLElement;
                  break;
                }
              }
            }

            // If not found in images, try videos
            if (!element) {
              const videos = Array.from(editorRoot.querySelectorAll('video'));
              for (const video of videos) {
                const src = video.getAttribute('src') || '';
                // Also check source elements within video
                const sources = Array.from(video.querySelectorAll('source'));
                const hasMatchingSrc =
                  src.includes(searchText) ||
                  sources.some((source) =>
                    (source.getAttribute('src') || '').includes(searchText),
                  );

                if (hasMatchingSrc) {
                  console.log('✅ Found element by video src:', video);
                  element = video as HTMLElement;
                  break;
                }
              }
            }
          }
        }

        if (element) {
          console.log('✅ Found element for animation:', element);
          return element;
        }
      }

      console.warn(
        '❌ Could not find element for targetNodeKey:',
        targetNodeKey,
        'directiveId:',
        animation?.directiveId,
        'stableId:',
        animation?.stableId,
      );
      return null;
    };

    // Create engine with custom element finder
    const engine = new AnimationEngine(animations, {
      prefersReducedMotion: AnimationEngine.prefersReducedMotion(),
      findElement: findElementByStableId,
      onAnimationStart: (id) => {
        console.log('▶️ Animation started:', id);
      },
      onAnimationComplete: (id) => {
        console.log('✅ Animation completed:', id);
      },
      onAllComplete: () => {
        console.log('🎉 All animations completed');
        // Nothing left to pause — the control switches to "replay".
        setIsComplete(true);
      },
    });

    engineRef.current = engine;

    // Auto-play animations, but wait briefly for the MDXEditor DOM to mount.
    // In the player, markdown is set in a separate effect; animations may be parsed
    // before directive wrappers (data-anim-directive-id) are present in the DOM.
    (async () => {
      const directiveIds = animations
        .map((a) => a.directiveId)
        .filter((id): id is string => Boolean(id));

      if (directiveIds.length > 0) {
        for (let attempt = 0; attempt < 40; attempt++) {
          const foundAny = directiveIds.some((id) =>
            document.querySelector(`[data-anim-directive-id="${id}"]`),
          );
          if (foundAny) break;
          await delay(50);
        }
      } else {
        // Legacy V1 (stableId) content: still give the DOM a moment to render.
        await delay(50);
      }

      engine.playAll().catch((error) => {
        console.error('❌ Error playing animations:', error);
      });
    })();

    // Cleanup on unmount or slide change
    return () => {
      console.log('🧹 Cleaning up animations');
      if (engineRef.current) {
        engineRef.current.cleanup();
        engineRef.current = null;
      }
    };
  }, [animations, slideIndex, enabled]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    setIsPaused(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  /**
   * Replay the slide's animations from the start. Used once the sequence has
   * finished, when pausing is no longer meaningful.
   */
  const replay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.reset();
    setIsPaused(false);
    setIsComplete(false);
    engine.playAll().catch((error) => {
      console.error('❌ Error replaying animations:', error);
    });
  }, []);

  return {
    engine: engineRef.current,
    isPlaying: engineRef.current?.getPlaybackState() === 'playing',
    hasAnimations,
    isPaused,
    isComplete,
    pause,
    resume,
    toggle,
    replay,
  };
}
