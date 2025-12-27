import { realmPlugin, addComposerChild$ } from '@mdxeditor/editor';
import { AnimationDrawer } from './components/AnimationDrawer';
import { AnimationResolver } from './components/AnimationResolver';
import { AnimationConfig } from './types/Animation.types';
import {
  slideAnimations$,
  selectedAnimation$,
  animationDrawerOpen$,
  setAnimations$,
} from './state/animationCells';

import { getMarkdownFn$, setMarkdownFn$ } from './state/animationCells';
import { areAnimationsEqual } from './utils/animationComparison';
import { debugLog, onAnimDirectiveClick$ } from '@rapid-cmi5/ui';
export interface AnimationPluginParams {
  initialAnimations?: AnimationConfig[];
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
    debugLog(
      '[AnimationPlugin] init() called with initialAnimations:',
      params?.initialAnimations?.length ?? 0,
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
    });

    // Use setAnimations$ signal to load animations (AnimationResolver will resolve keys)
    // Do NOT directly publish to slideAnimations$ - that creates an infinite loop with AnimationResolver
    realm.pub(setAnimations$, params?.initialAnimations ?? []);
    debugLog(
      '[AnimationPlugin] init() sent setAnimations$ signal with:',
      params?.initialAnimations?.length ?? 0,
      undefined,
      'plugin',
    );

    // Subscribe to animation changes
    if (params?.onAnimationsChange) {
      realm.sub(slideAnimations$, (animations) => {
        params.onAnimationsChange!(animations);
      });
    }

    // Handle clicks on animation directive badges
    realm.sub(onAnimDirectiveClick$, (directiveId) => {
      debugLog(
        '🎯 onAnimDirectiveClick$ received:',
        directiveId,
        undefined,
        'drawer',
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
          'drawer',
        );
        // Open drawer
        realm.pub(animationDrawerOpen$, true);
        // Select animation
        realm.pub(selectedAnimation$, matchingAnim.id);
      } else {
        console.warn('⚠️ No animation found for directiveId:', directiveId);
        // Still open drawer so user can see what animations exist
        realm.pub(animationDrawerOpen$, true);
      }
    });
  },

  update(realm, params) {
    debugLog(
      '[AnimationPlugin] update() called with initialAnimations:',
      params?.initialAnimations?.length ?? 0,
      undefined,
      'plugin',
    );
    debugLog(
      '[AnimationPlugin] update() Stack:',
      new Error().stack?.split('\n').slice(2, 5).join('\n'),
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
      // Use setAnimations$ signal to load animations (AnimationResolver will resolve keys)
      // Do NOT directly publish to slideAnimations$ - that creates an infinite loop with AnimationResolver
      realm.pub(setAnimations$, incoming);
      debugLog(
        '[AnimationPlugin] update() sent setAnimations$ signal with:',
        incoming.length,
        undefined,
        'plugin',
      );
    }

    // Update markdown functions
    realm.pubIn({
      [getMarkdownFn$]: params?.getMarkdown ?? null,
      [setMarkdownFn$]: params?.setMarkdown ?? null,
    });
  },
});
