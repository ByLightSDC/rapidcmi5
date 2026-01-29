import { AnimationConfig, debugLog } from "@rapid-cmi5/ui";


/**
 * Update visual indicators on elements to show they have animations
 * @param animations - Animations to display indicators for
 */
export function updateAnimationIndicators(
  animations: AnimationConfig[],
): void {
  debugLog(
    `🔄 [updateAnimationIndicators] Updating animation indicators`,
    {
      ids: animations.map((a) => a.id),
      targets: animations.map((a) => a.targetNodeKey),
      directives: animations.map((a) => a.directiveId),
      stableIds: animations.map((a) => a.stableId),
    },
    undefined,
    'indicators',
  );
  // Clear all existing indicators
  clearAnimationIndicators();

  if (animations.length === 0) return;

  // Group animations by directiveId (V2 - required for all animations)
  const animationsByTarget = new Map<string, AnimationConfig[]>();

  animations.forEach((anim) => {
    if (!anim.directiveId) {
      console.warn(
        'Animation missing directiveId, skipping indicator:',
        anim.id,
      );
      return;
    }
    const existing = animationsByTarget.get(anim.directiveId) || [];
    existing.push(anim);
    animationsByTarget.set(anim.directiveId, existing);
  });

  // Add indicators to each animated element
  animationsByTarget.forEach((targetAnimations, directiveId) => {
    const element = findElementByDirectiveId(directiveId);
    if (!element) {
      debugLog(
        '⚠️ Element not found for animation indicator',
        { directiveId },
        undefined,
        'indicators',
      );
      return;
    }

    // Mark as animated
    element.setAttribute('data-has-animation', 'true');

    // Add animation order (for PowerPoint-style numbering)
    // Use the lowest order number for this element
    const minOrder = Math.min(...targetAnimations.map((a) => a.order));
    element.setAttribute('data-animation-order', String(minOrder));

    // Add animation count if multiple animations
    if (targetAnimations.length > 1) {
      element.setAttribute(
        'data-animation-count',
        String(targetAnimations.length),
      );
    }

    // Check if any animations are disabled
    const allDisabled = targetAnimations.every((anim) => !anim.enabled);
    if (allDisabled) {
      element.setAttribute('data-animation-disabled', 'true');
    }

    debugLog(
      '✅ [updateAnimationIndicators] Applied indicators',
      {
        directiveId,
        minOrder,
        count: targetAnimations.length,
        allDisabled,
      },
      undefined,
      'indicators',
    );
  });
}

/**
 * Clear all animation indicators
 */
export function clearAnimationIndicators(): void {
  const editorRoot = document.querySelector('.mdxeditor-root-contenteditable');
  if (!editorRoot) return;

  const animatedElements = editorRoot.querySelectorAll('[data-has-animation]');
  animatedElements.forEach((element) => {
    element.removeAttribute('data-has-animation');
    element.removeAttribute('data-animation-order');
    element.removeAttribute('data-animation-count');
    element.removeAttribute('data-animation-disabled');
    element.removeAttribute('data-animation-selected');
    element.removeAttribute('data-animation-playing');
  });
}

/**
 * Highlight a specific animated element
 */
export function highlightAnimatedElement(nodeKey: string | null): void {
  // Clear previous highlights
  const editorRoot = document.querySelector('.mdxeditor-root-contenteditable');
  if (!editorRoot) return;

  const previouslySelected = editorRoot.querySelectorAll(
    '[data-animation-selected="true"]',
  );
  previouslySelected.forEach((el) => {
    el.removeAttribute('data-animation-selected');
  });

  // Highlight new element
  if (nodeKey) {
    const element = findElementByDirectiveId(nodeKey);
    if (element) {
      element.setAttribute('data-animation-selected', 'true');

      // Scroll into view if not visible
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/**
 * Mark element as currently playing animation
 */
export function markAnimationPlaying(
  nodeKey: string,
  isPlaying: boolean,
): void {
  const element = findElementByDirectiveId(nodeKey);
  if (element) {
    if (isPlaying) {
      element.setAttribute('data-animation-playing', 'true');
    } else {
      element.removeAttribute('data-animation-playing');
    }
  }
}

/**
 * Find element by anim directive id (V2 stable identifier)
 */
function findElementByDirectiveId(directiveId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-anim-directive-id="${directiveId}"]`,
  );
}
