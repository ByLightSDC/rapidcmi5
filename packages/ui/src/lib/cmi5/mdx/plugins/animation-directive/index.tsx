/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import {
  realmPlugin,
  addActivePlugin$,
  addComposerChild$,
  addNestedEditorChild$,
  Cell,
  Signal,
  useNestedEditorContext,
} from '@mdxeditor/editor';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  SELECTION_CHANGE_COMMAND,
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { usePublisher } from '@mdxeditor/gurx';

import AnimationDirectiveRegistry from '../../editors/AnimationDirectiveRegistry';
import { AnimationConfig } from '../../animation/types/Animation.types';


/**
 * Cell for storing current slide's animations (published from app layer)
 * Directives subscribe to this to get their order numbers
 */
export const slideAnimationsForDirectives$ = Cell<AnimationConfig[]>([]);

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
 * Signal triggered when animation directive unwrap is requested
 * App layer should subscribe to this to delete the animation config
 */
export const onAnimDirectiveDelete$ = Signal<string>();

/**
 * Cell that holds the animation ID to unwrap
 * Descriptors watch this cell and trigger unwrap when it matches their animation
 */
export const animationToUnwrap$ = Cell<string | null>(null);

/**
 * Whether the active editor selection sits inside an :::anim directive.
 * Published by NestedAnimSelectionBridge (rendered inside every NestedLexicalEditor
 * but only active when its parent mdast node is name='anim'). The outer editor's
 * selection-change handler resets this to false; the bridge re-asserts true on
 * selection-change inside the nested anim editor, and clears on blur.
 *
 * Drives the "Selected elements already animated" message in the animation drawer.
 */
export const selectionInsideAnimDirective$ = Cell<boolean>(false);

/**
 * Plugin component injected into every NestedLexicalEditor. Bails out unless its
 * parent directive is `:::anim` (or inline `:anim`). Bridges nested-editor
 * selection events up to the outer-editor world via `selectionInsideAnimDirective$`.
 */
function NestedAnimSelectionBridge() {
  const ctx = useNestedEditorContext();
  const [editor] = useLexicalComposerContext();
  const publish = usePublisher(selectionInsideAnimDirective$);

  const isAnim =
    (ctx?.mdastNode as { name?: string } | undefined)?.name === 'anim';

  useEffect(() => {
    if (!isAnim) return;

    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        publish(true);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterBlur = editor.registerCommand(
      BLUR_COMMAND,
      () => {
        publish(false);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterSelection();
      unregisterBlur();
    };
  }, [editor, isAnim, publish]);

  return null;
}

/**
 * Signal published by descriptors after successfully unwrapping
 * App layer should subscribe to this to delete the animation config
 */
export const onAnimationUnwrapped$ = Signal<string>();

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
      [addNestedEditorChild$]: NestedAnimSelectionBridge,
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
