import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { usePublisher, useRealm } from '@mdxeditor/gurx';
import { slideAnimations$, setAnimations$ } from '../state/animationCells';
import { resolveAnimations } from '../utils/stableIdentifiers';
import { resolveDirectiveAnimations } from '../utils/directiveResolver';
import { updateAnimationIndicators } from '../utils/updateAnimationIndicators';
import { addAnimationIdsToElements } from '../utils/lexicalDomBridge';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Internal component that resolves animation IDs to current node keys when loading from markdown
 *
 * ARCHITECTURE (prevents infinite loop):
 * - Subscribes to setAnimations$ signal (one-time load events from markdown)
 * - Resolves directiveId/stableId → targetNodeKey using editor state
 * - Publishes resolved animations DIRECTLY to slideAnimations$ cell
 * - Does NOT observe slideAnimations$ cell (that would create infinite loop)
 *
 * Flow: markdown → setAnimations$ signal → AnimationResolver → slideAnimations$ cell
 */
export function AnimationResolver() {
  const [editor] = useLexicalComposerContext();
  const realm = useRealm();
  const publishSlideAnimations = usePublisher(slideAnimations$);

  useEffect(() => {
    // Keep indicators in sync with ANY change to slideAnimations$ (adds/reorders/deletes)
    const unsubscribeIndicators = realm.sub(slideAnimations$, (animations) => {
      // Small async defer to ensure DOM updates settle before tagging
      setTimeout(() => updateAnimationIndicators(animations), 0);
    });

    // Subscribe to setAnimations$ signal and handle resolution
    const unsubscribe = realm.sub(setAnimations$, (rawAnimations) => {
      debugLog(
        `📥 AnimationResolver received setAnimations$ signal with ${rawAnimations.length} items`,
      );

      // Re-tag DOM elements with animation IDs whenever animations are loaded (e.g., slide switch)
      // This ensures elements can be selected for animations on the new slide
      setTimeout(() => {
        addAnimationIdsToElements(editor);
        debugLog('🔄 Re-tagged animation IDs after loading animations');
      }, 150);

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

        // Still update indicators
        setTimeout(() => {
          updateAnimationIndicators(rawAnimations);
        }, 100);
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
      );
      publishSlideAnimations(resolved);

      // Update visual indicators
      setTimeout(() => {
        debugLog('🔄 Updating animation indicators');
        updateAnimationIndicators(resolved);
      }, 100);
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
