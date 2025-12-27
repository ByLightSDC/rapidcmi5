import { Cell, Signal, Action, map, withLatestFrom } from '@mdxeditor/gurx';
import { AnimationConfig, PlaybackState } from '../types/Animation.types';

/**
 * Helper to log slideAnimations$ updates with stack trace
 */
function logAnimationsUpdate(source: string, animations: AnimationConfig[]) {
  console.log(`[slideAnimations$] ${source} → ${animations.length} items`);
  console.log(`[slideAnimations$] Stack:`, new Error().stack?.split('\n').slice(2, 5).join('\n'));
}

/**
 * All animations for the current slide
 * This is the source of truth for animation configuration
 */
export const slideAnimations$ = Cell<AnimationConfig[]>([], (r) => {
  // Handle addAnimation$
  r.sub(
    r.pipe(addAnimation$, withLatestFrom(slideAnimations$)),
    ([newAnim, currentAnims]) => {
      const nextOrder = currentAnims.length + 1;
      const animation: AnimationConfig = {
        ...newAnim,
        id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order: nextOrder,
      };

      const updated = [...currentAnims, animation];
      logAnimationsUpdate('addAnimation$', updated);
      r.pub(slideAnimations$, updated);
      r.pub(selectedAnimation$, animation.id);
    },
  );

  // Handle updateAnimation$
  r.sub(
    r.pipe(updateAnimation$, withLatestFrom(slideAnimations$)),
    ([{ id, updates }, currentAnims]) => {
      const updated = currentAnims.map((anim) =>
        anim.id === id ? { ...anim, ...updates } : anim,
      );
      logAnimationsUpdate('updateAnimation$', updated);
      r.pub(slideAnimations$, updated);
    },
  );

  // Handle deleteAnimation$
  r.sub(
    r.pipe(deleteAnimation$, withLatestFrom(slideAnimations$)),
    ([id, currentAnims]) => {
      const filtered = currentAnims.filter((anim) => anim.id !== id);
      // Reorder remaining animations
      const reordered = filtered.map((anim, index) => ({
        ...anim,
        order: index + 1,
      }));
      logAnimationsUpdate('deleteAnimation$', reordered);
      r.pub(slideAnimations$, reordered);

      // Clear selection if deleted
      const selected = r.getValue(selectedAnimation$);
      if (selected === id) {
        r.pub(selectedAnimation$, null);
      }
    },
  );

  // Handle reorderAnimations$
  r.sub(
    r.pipe(reorderAnimations$, withLatestFrom(slideAnimations$)),
    ([{ fromIndex, toIndex }, currentAnims]) => {
      const reordered = [...currentAnims];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      // Update order numbers
      const updated = reordered.map((anim, index) => ({
        ...anim,
        order: index + 1,
      }));

      logAnimationsUpdate('reorderAnimations$', updated);
      r.pub(slideAnimations$, updated);
    },
  );

  // NOTE: setAnimations$ is handled by AnimationResolver component
  // The resolver intercepts the signal, resolves directiveId/stableId → targetNodeKey,
  // then publishes the resolved animations to slideAnimations$
  // This prevents infinite loops by keeping resolution separate from observation

  // Handle moveAnimationUp$
  r.sub(
    r.pipe(moveAnimationUp$, withLatestFrom(slideAnimations$)),
    ([animationId, currentAnims]) => {
      const currentIndex = currentAnims.findIndex((a) => a.id === animationId);

      // Can't move up if it's already first
      if (currentIndex <= 0) return;

      // Move up by swapping with previous animation
      r.pub(reorderAnimations$, {
        fromIndex: currentIndex,
        toIndex: currentIndex - 1,
      });
    },
  );

  // Handle moveAnimationDown$
  r.sub(
    r.pipe(moveAnimationDown$, withLatestFrom(slideAnimations$)),
    ([animationId, currentAnims]) => {
      const currentIndex = currentAnims.findIndex((a) => a.id === animationId);

      // Can't move down if it's already last
      if (currentIndex < 0 || currentIndex >= currentAnims.length - 1) return;

      // Move down by swapping with next animation
      r.pub(reorderAnimations$, {
        fromIndex: currentIndex,
        toIndex: currentIndex + 1,
      });
    },
  );
});

/**
 * ID of currently selected animation in drawer
 */
export const selectedAnimation$ = Cell<string | null>(null);

/**
 * Drawer open/closed state
 */
export const animationDrawerOpen$ = Cell<boolean>(false, (r) => {
  // Handle toggleAnimationDrawer$
  r.link(
    r.pipe(
      toggleAnimationDrawer$,
      withLatestFrom(animationDrawerOpen$),
      map(([, isOpen]) => !isOpen),
    ),
    animationDrawerOpen$,
  );
});

/**
 * Node key of currently selected element in editor
 */
export const selectedElement$ = Cell<string | null>(null);

/**
 * Current playback state
 */
export const playbackState$ = Cell<PlaybackState>(PlaybackState.IDLE);

/**
 * Reduced motion preference (accessibility)
 */
export const prefersReducedMotion$ = Cell<boolean>(false);

/**
 * MDXEditor markdown getter function
 * Allows plugin to access current markdown content
 */
export const getMarkdownFn$ = Cell<(() => string) | null>(null);

/**
 * MDXEditor markdown setter function
 * Allows plugin to update markdown content
 */
export const setMarkdownFn$ = Cell<((markdown: string) => void) | null>(null);

// ============================================
// Signals
// ============================================

/**
 * Add a new animation to the timeline
 */
export const addAnimation$ = Signal<Omit<AnimationConfig, 'id' | 'order'>>();

/**
 * Update an existing animation
 */
export const updateAnimation$ = Signal<{
  id: string;
  updates: Partial<AnimationConfig>;
}>();

/**
 * Delete an animation from timeline
 */
export const deleteAnimation$ = Signal<string>();

/**
 * Reorder animations in timeline
 */
export const reorderAnimations$ = Signal<{
  fromIndex: number;
  toIndex: number;
}>();

/**
 * Set all animations (used when loading from markdown)
 */
export const setAnimations$ = Signal<AnimationConfig[]>();

/**
 * Play a single animation (preview)
 */
export const playAnimation$ = Signal<string>();

/**
 * Move animation up in the timeline (decrease order)
 */
export const moveAnimationUp$ = Signal<string>();

/**
 * Move animation down in the timeline (increase order)
 */
export const moveAnimationDown$ = Signal<string>();

// ============================================
// Actions
// ============================================

/**
 * Toggle drawer open/closed
 */
export const toggleAnimationDrawer$ = Action((r) => {
  r.sub(toggleAnimationDrawer$, () => {
    const isOpen = r.getValue(animationDrawerOpen$);
    r.pub(animationDrawerOpen$, !isOpen);
  });
});

/**
 * Play all animations in sequence
 */
export const playAllAnimations$ = Action((r) => {
  r.sub(playAllAnimations$, () => {
    r.pub(playbackState$, PlaybackState.PLAYING);
  });
});

/**
 * Stop current playback
 */
export const stopPlayback$ = Action((r) => {
  r.sub(stopPlayback$, () => {
    r.pub(playbackState$, PlaybackState.IDLE);
  });
});
