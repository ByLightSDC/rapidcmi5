import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { usePublisher, useRealm } from '@mdxeditor/gurx';
import {
  slideAnimations$,
  setAnimations$,
  currentSlideIndex$,
} from '../state/animationCells';
import { resolveAnimations } from '../utils/stableIdentifiers';
import { resolveDirectiveAnimations } from '../utils/directiveResolver';
import { updateAnimationIndicators } from '../utils/updateAnimationIndicators';
import { slideAnimationsForDirectives$, debugLog } from '@rapid-cmi5/ui';

/**
 * Internal component that resolves animation IDs to current node keys when loading from markdown
 *
 * ARCHITECTURE V2 (self-sufficient directives):
 * - Subscribes to setAnimations$ signal (one-time load events from markdown)
 * - Resolves directiveId/stableId → targetNodeKey using editor state
 * - Publishes resolved animations to BOTH:
 *   1. slideAnimations$ cell (for app layer / drawer)
 *   2. slideAnimationsForDirectives$ cell (for directive components to read order)
 * - Directives subscribe to slideAnimationsForDirectives$ and display order directly
 * - No more DOM attribute bridging for order numbers!
 * - updateAnimationIndicators() still sets hover/selection/disabled states
 *
 * Flow: markdown → setAnimations$ signal → AnimationResolver → slideAnimations$ + slideAnimationsForDirectives$ → Directives
 */
export function AnimationResolver() {
  const [editor] = useLexicalComposerContext();
  const realm = useRealm();
  const publishSlideAnimations = usePublisher(slideAnimations$);

  useEffect(() => {
    // Keep indicators in sync with ANY change to slideAnimations$ (adds/reorders/deletes)
    const unsubscribeIndicators = realm.sub(slideAnimations$, (animations) => {
      // NEW ARCHITECTURE: Publish to slideAnimationsForDirectives$ cell
      // This allows directives to read order directly instead of via DOM attributes
      realm.pub(slideAnimationsForDirectives$, animations);

      // Defer to next frame to ensure directive components have rendered and set their attributes
      requestAnimationFrame(() => {
        updateAnimationIndicators(animations);
      });
    });

    // Subscribe to setAnimations$ signal and handle resolution
    const unsubscribe = realm.sub(setAnimations$, (payload) => {
      // CRITICAL: Validate slideIndex to prevent cross-slide contamination
      const payloadSlideIndex = payload?.slideIndex ?? -1;
      const currentSlideInRealm = realm.getValue(currentSlideIndex$);

      debugLog(
        `📥 AnimationResolver received setAnimations$ signal for slide ${payloadSlideIndex}`,
        undefined,
        undefined,
        'plugin',
      );

      // Reject stale signals from previous slides
      if (payloadSlideIndex !== currentSlideInRealm) {
        debugLog(
          `⚠️ REJECTED stale setAnimations$ signal: payload slide=${payloadSlideIndex}, current slide=${currentSlideInRealm}`,
          { payloadCount: payload?.animations?.length ?? 0 },
          undefined,
          'plugin',
        );
        return; // IGNORE this signal - it's from a stale editor instance
      }

      const rawAnimations = payload?.animations ?? [];

      debugLog(
        `📥 AnimationResolver processing setAnimations$ signal with ${rawAnimations.length} items for slide ${payloadSlideIndex}`,
        undefined,
        undefined,
        'plugin',
      );

      // If empty, just clear the cell
      if (rawAnimations.length === 0) {
        debugLog('🧹 No animations to resolve, clearing cell');
        publishSlideAnimations([]);
        return;
      }

      // Check if any animation has a stable ID or directive ID
      const needsResolution = rawAnimations.some(
        (anim) => anim.stableId || anim.directiveId,
      );

      if (!needsResolution) {
        debugLog(
          '✅ Animations have no IDs to resolve, passing through without resolution',
        );
        publishSlideAnimations(rawAnimations);
        updateAnimationIndicators(rawAnimations);
        return;
      }

      // Resolve keys immediately (no delay) so indicators always have current keys
      debugLog('🔄 Resolving animation keys...');

      // First resolve V2 directive-based animations
      let resolved = resolveDirectiveAnimations(editor, rawAnimations);
      debugLog('✅ Resolved directive-based animations (V2)');

      // Then resolve V1 stable-ID-based animations
      resolved = resolveAnimations(editor, resolved);
      debugLog('✅ Resolved stable-ID-based animations (V1)');

      // Publish resolved animations to the cell
      debugLog(
        `📤 Publishing ${resolved.length} resolved animations to slideAnimations$ cell`,
        undefined,
        undefined,
        'plugin',
      );
      publishSlideAnimations(resolved);

      // Update visual indicators
      updateAnimationIndicators(resolved);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (typeof unsubscribeIndicators === 'function') {
        unsubscribeIndicators();
      }
    };
  }, [editor, realm, publishSlideAnimations]);

  return null; // This is a logic-only component, renders nothing
}
