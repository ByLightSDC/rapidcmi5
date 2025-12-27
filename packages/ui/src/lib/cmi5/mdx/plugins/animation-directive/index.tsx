/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import {
  realmPlugin,
  addActivePlugin$,
  addComposerChild$,
  Cell,
  Signal,
} from '@mdxeditor/editor';

import AnimationDirectiveRegistry from '../../editors/AnimationDirectiveRegistry';

/**
 * Cell for storing click handler (passed from app layer)
 */
export const animDirectiveClickHandler$ = Cell<
  ((directiveId: string) => void) | null
>(null);

/**
 * Signal triggered when an animation directive badge is clicked
 * App layer should subscribe to this to open drawer and select animation
 */
export const onAnimDirectiveClick$ = Signal<string>();

/**
 * Animation Directive Plugin
 *
 * Enables tracking and display of animation directive order in the editor.
 *
 * Pattern: Same as footnotePlugin
 * - Registers AnimationDirectiveRegistry via addComposerChild$
 * - Registry automatically tracks :::anim directives
 * - Provides order numbers to AnimDirectiveDescriptor
 *
 * Usage:
 * ```typescript
 * import { animationDirectivePlugin } from '@rangeos-nx/ui/branded';
 *
 * <MDXEditor
 *   plugins={[
 *     // ... other plugins
 *     animationDirectivePlugin({
 *       onDirectiveClick: (directiveId) => {
 *         // Open drawer and select animation
 *       }
 *     }),
 *   ]}
 * />
 * ```
 *
 * What it does:
 * - Scans editor for :::anim{id="..."} directives
 * - Maintains order automatically (1, 2, 3...)
 * - Publishes state via Gurx cells
 * - AnimDirectiveDescriptor uses order for badges
 * - Handles click events on badges
 *
 * @group Animation
 */
export const animationDirectivePlugin = realmPlugin<{
  onDirectiveClick?: (directiveId: string) => void;
}>({
  init(realm, params) {
    realm.pubIn({
      [addActivePlugin$]: 'animationDirective',
      [addComposerChild$]: AnimationDirectiveRegistry,
    });

    // Set up click handler that publishes to the action
    if (params?.onDirectiveClick) {
      // Custom handler provided by app
      realm.pub(animDirectiveClickHandler$, params.onDirectiveClick);
    } else {
      // Default handler: publish to action (app layer can subscribe)
      realm.pub(animDirectiveClickHandler$, (directiveId: string) => {
        realm.pub(onAnimDirectiveClick$, directiveId);
      });
    }
  },
});
