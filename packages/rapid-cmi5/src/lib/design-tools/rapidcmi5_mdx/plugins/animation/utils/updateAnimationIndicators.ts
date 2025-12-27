import { debugLog } from "@rapid-cmi5/ui";
import { AnimationConfig } from "../types/Animation.types";

/**
 * Update visual indicators on elements to show they have animations
 */
export function updateAnimationIndicators(animations: AnimationConfig[]): void {
  debugLog(
    '🔄 [updateAnimationIndicators] Updating animation indicators',
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

  // Group animations by a stable-ish target key:
  // - V2 directives: directiveId (stable across Lexical re-keys)
  // - V1/other: targetNodeKey (runtime)
  const animationsByTarget = new Map<string, AnimationConfig[]>();

  animations.forEach((anim) => {
    const targetKey = anim.directiveId || anim.targetNodeKey;
    const existing = animationsByTarget.get(targetKey) || [];
    existing.push(anim);
    animationsByTarget.set(targetKey, existing);
  });

  // Add indicators to each animated element
  animationsByTarget.forEach((targetAnimations, targetKey) => {
    const element = targetAnimations[0]?.directiveId
      ? findElementByDirectiveId(targetAnimations[0].directiveId)
      : findElementByKey(targetKey);
    if (!element) {
      debugLog(
        '⚠️ Element not found for animation indicator',
        { targetKey },
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
        targetKey,
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
    const element =
      findElementByKey(nodeKey) ?? findElementByDirectiveId(nodeKey);
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
  const element =
    findElementByKey(nodeKey) ?? findElementByDirectiveId(nodeKey);
  if (element) {
    if (isPlaying) {
      element.setAttribute('data-animation-playing', 'true');
    } else {
      element.removeAttribute('data-animation-playing');
    }
  }
}

/**
 * Find element by Lexical node key
 */
function findElementByKey(nodeKey: string): HTMLElement | null {
  // Try data-animation-id first (primary method)
  let element = document.querySelector<HTMLElement>(
    `[data-animation-id="${nodeKey}"]`,
  );

  // Try data-animation-target (fallback)
  if (!element) {
    element = document.querySelector<HTMLElement>(
      `[data-animation-target="${nodeKey}"]`,
    );
  }

  // Try data-lexical-key (legacy fallback)
  if (!element) {
    element = document.querySelector<HTMLElement>(
      `[data-lexical-key="${nodeKey}"]`,
    );
  }

  return element;
}

/**
 * Find element by anim directive id (V2 stable identifier)
 */
function findElementByDirectiveId(directiveId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-anim-directive-id="${directiveId}"]`,
  );
}
