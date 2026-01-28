import { realmPlugin, addComposerChild$ } from '@mdxeditor/editor';
import { AnimationDrawer } from './components/AnimationDrawer';
import { AnimationResolver } from './components/AnimationResolver';
import { AnimationConfig } from './types/Animation.types';
import {
  slideAnimations$,
  selectedAnimation$,
  animationDrawerOpen$,
  setAnimations$,
  currentSlideIndex$,
  onAnimationsChangeCb$,
} from './state/animationCells';

import { getMarkdownFn$, setMarkdownFn$ } from './state/animationCells';
import { areAnimationsEqual } from './utils/animationComparison';
import { highlightAnimatedElement } from './utils/updateAnimationIndicators';
import { debugLog, onAnimDirectiveClick$ } from '@rapid-cmi5/ui';

export interface AnimationPluginParams {
  initialAnimations?: AnimationConfig[];
  slideIndex?: number;
  onAnimationsChange?: (animations: AnimationConfig[]) => void;
  getMarkdown?: () => string;
  setMarkdown?: (markdown: string) => void;
}

/**
 * Animation plugin for MDXEditor
 * Adds PowerPoint-like animation timeline capabilities
 */
export const animationPlugin = realmPlugin<AnimationPluginParams>({
  init(realm, params) {
    const slideIndex = params?.slideIndex ?? -1;

    debugLog(
      '[AnimationPlugin] init() called with initialAnimations:',
      params?.initialAnimations?.length ?? 0,
      undefined,
      'plugin',
    );
    debugLog(
      '[AnimationPlugin] init',
      { slideIndex, initialCount: params?.initialAnimations?.length ?? 0 },
      undefined,
      'plugin',
    );
    debugLog(
      '[AnimationPlugin] init() Stack:',
      new Error().stack?.split('\n').slice(2, 5).join('\n'),
      undefined,
      'plugin',
    );

    // Add components first
    realm.pubIn({
      [addComposerChild$]: [AnimationDrawer, AnimationResolver],
      [getMarkdownFn$]: params?.getMarkdown ?? null,
      [setMarkdownFn$]: params?.setMarkdown ?? null,
      [currentSlideIndex$]: slideIndex,
      [onAnimationsChangeCb$]: params?.onAnimationsChange ?? null,
    });

    // Use setAnimations$ signal to load animations (AnimationResolver will resolve keys)
    // Do NOT directly publish to slideAnimations$ - that creates an infinite loop with AnimationResolver
    realm.pub(setAnimations$, {
      animations: params?.initialAnimations ?? [],
      slideIndex,
    });
    debugLog(
      `[AnimationPlugin] init() sent setAnimations$ signal with: ${params?.initialAnimations?.length ?? 0} items for slide ${slideIndex}`,
      undefined,
      undefined,
      'plugin',
    );

    // Subscribe to animation changes (subscription created once, callback updated via cell)
    realm.sub(slideAnimations$, (animations) => {
      const callback = realm.getValue(onAnimationsChangeCb$);
      const currentSlide = realm.getValue(currentSlideIndex$);

      debugLog(
        `[AnimationPlugin] slideAnimations$ changed, invoking callback for slide ${currentSlide}`,
        { animationCount: animations.length, hasCallback: !!callback },
        undefined,
        'plugin',
      );

      if (callback) {
        callback(animations);
      }
    });

    // Handle clicks on animation directive badges
    realm.sub(onAnimDirectiveClick$, (directiveId) => {
      debugLog(
        '🎯 onAnimDirectiveClick$ received:',
        directiveId,
        undefined,
        'plugin',
      );

      // Find the animation that has this directiveId
      const animations = realm.getValue(slideAnimations$);
      const matchingAnim = animations.find(
        (anim) => anim.directiveId === directiveId,
      );

      if (matchingAnim) {
        debugLog(
          '✅ Found matching animation:',
          matchingAnim.id,
          undefined,
          'plugin',
        );
        // Open drawer
        realm.pub(animationDrawerOpen$, true);
        // Select animation
        realm.pub(selectedAnimation$, matchingAnim.id);
        // Highlight the element in the editor (orange badge)
        highlightAnimatedElement(directiveId);
      } else {
        console.warn('⚠️ No animation found for directiveId:', directiveId);
        // Still open drawer so user can see what animations exist
        realm.pub(animationDrawerOpen$, true);
        // Still highlight the directive element even if no animation config found
        highlightAnimatedElement(directiveId);
      }
    });
  },

  update(realm, params) {
    const slideIndex = params?.slideIndex ?? -1;

    // PRESERVE selected animation before any updates
    const previouslySelected = realm.getValue(selectedAnimation$);

    // Update the current slide index in realm FIRST, before reading anything
    realm.pub(currentSlideIndex$, slideIndex);

    const currentSlideInRealm = realm.getValue(currentSlideIndex$);

    debugLog(
      '[AnimationPlugin] update',
      {
        slideIndex,
        currentSlideInRealm,
        initialCount: params?.initialAnimations?.length ?? 0,
      },
      undefined,
      'plugin',
    );

    debugLog(
      '[AnimationPlugin] Current slideAnimations$ before update:',
      realm.getValue(slideAnimations$).length,
      undefined,
      'plugin',
    );

    // If incoming animations match current resolved animations, skip publish to avoid churn
    const currentResolved = realm.getValue(slideAnimations$);
    const incoming = params?.initialAnimations ?? [];

    if (incoming.length === 0 && currentResolved.length === 0) {
      debugLog(
        '[AnimationPlugin] update() both incoming and current animations are empty; skipping setAnimations$',
        undefined,
        undefined,
        'plugin',
      );
    } else if (areAnimationsEqual(currentResolved, incoming)) {
      debugLog(
        '[AnimationPlugin] update() incoming animations identical to current; skipping setAnimations$',
        undefined,
        undefined,
        'plugin',
      );
    } else {
      debugLog(
        '[AnimationPlugin] animations NOT equal, publishing setAnimations$',
        undefined,
        undefined,
        'plugin',
      );

      // Log first difference found
      for (
        let i = 0;
        i < Math.max(currentResolved.length, incoming.length);
        i++
      ) {
        const curr = currentResolved[i];
        const inc = incoming[i];
        if (!curr || !inc || JSON.stringify(curr) !== JSON.stringify(inc)) {
          debugLog(
            `[AnimationPlugin] first difference at index ${i}`,
            {
              currentId: curr?.id?.slice(-8),
              currentTrigger: curr?.trigger,
              incomingId: inc?.id?.slice(-8),
              incomingTrigger: inc?.trigger,
            },
            undefined,
            'plugin',
          );
          break;
        }
      }
      // Use setAnimations$ signal to load animations (AnimationResolver will resolve keys)
      // Do NOT directly publish to slideAnimations$ - that creates an infinite loop with AnimationResolver
      realm.pub(setAnimations$, {
        animations: incoming,
        slideIndex,
      });
      debugLog(
        `[AnimationPlugin] update() sent setAnimations$ signal with: ${incoming.length} items for slide ${slideIndex}`,
        undefined,
        undefined,
        'plugin',
      );
    }

    // Update markdown functions and callback
    realm.pubIn({
      [getMarkdownFn$]: params?.getMarkdown ?? null,
      [setMarkdownFn$]: params?.setMarkdown ?? null,
      [onAnimationsChangeCb$]: params?.onAnimationsChange ?? null,
    });

    // RESTORE selected animation if it still exists in the updated list
    // This prevents the selection from being lost during markdown re-parse cycles
    if (previouslySelected) {
      const incoming = params?.initialAnimations ?? [];
      const stillExists = incoming.some((a) => a.id === previouslySelected);
      if (stillExists) {
        debugLog(
          `[AnimationPlugin] Restoring selectedAnimation$: ${previouslySelected}`,
          undefined,
          undefined,
          'plugin',
        );
        // Use requestAnimationFrame to ensure this runs after AnimationResolver processes setAnimations$
        requestAnimationFrame(() => {
          realm.pub(selectedAnimation$, previouslySelected);
        });
      } else {
        debugLog(
          `[AnimationPlugin] Previously selected animation ${previouslySelected} no longer exists, not restoring`,
          undefined,
          undefined,
          'plugin',
        );
      }
    }
  },
});
