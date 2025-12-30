import { AnimationConfig, debugLog } from '@rapid-cmi5/ui';
import { LexicalEditor } from 'lexical';


/**
 * Remove animations whose target elements no longer exist in the editor
 * This prevents "ghost" animations after content is deleted
 *
 * Phase 1: Checks targetNodeKey against DOM elements
 * Phase 2: Skips directive-based animations (they use directiveId)
 */
export function cleanupOrphanedAnimations(
  editor: LexicalEditor,
  animations: AnimationConfig[],
): AnimationConfig[] {
  if (animations.length === 0) return animations;

  const validKeys = new Set<string>();

  // Collect all current node keys from editor
  editor.getEditorState().read(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    // Get all elements with animation IDs
    const animatedElements = editorElement.querySelectorAll(
      '[data-animation-id]',
    );
    animatedElements.forEach((el) => {
      const key = el.getAttribute('data-animation-id');
      if (key) validKeys.add(key);
    });
  });

  // Silently check for orphaned animations (only log when found)
  // console.log('🧹 Checking for orphaned animations...');
  // console.log('  Valid element keys:', Array.from(validKeys));
  // console.log('  Animation target keys:', animations.map(a => a.targetNodeKey));

  // Filter out animations targeting non-existent elements
  const cleanedAnimations = animations.filter((anim) => {
    // Phase 2: Skip cleanup for directive-based animations
    // They use directiveId for targeting, not targetNodeKey
    if (anim.directiveId) {
      // console.log(`⏭️ Skipping cleanup check for directive animation: ${anim.directiveId}`);
      return true; // Keep directive-based animations
    }

    // Phase 1: Check if targetNodeKey exists
    const exists = validKeys.has(anim.targetNodeKey);
    if (!exists) {
      console.warn(
        `🗑️ Removing orphaned animation: "${anim.targetLabel}" (key: ${anim.targetNodeKey})`,
      );
    }
    return exists;
  });

  // Only log when something was actually cleaned up
  if (cleanedAnimations.length < animations.length) {
    debugLog(
      `✅ Auto-cleaned ${animations.length - cleanedAnimations.length} orphaned animation(s)`,
      undefined,
      undefined,
      'engine',
    );

    debugLog(
      '  Valid element keys:',
      Array.from(validKeys),
      undefined,
      'engine',
    );

  }

  return cleanedAnimations;
}
