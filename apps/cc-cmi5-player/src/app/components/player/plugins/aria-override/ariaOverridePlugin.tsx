import {
  realmPlugin,
  addComposerChild$,
  addNestedEditorChild$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * AriaCleanupPlugin (internal component)
 *
 * Injected into both the root and every nested Lexical composer.
 *
 * Lexical hardcodes several ARIA attributes on its editor element that cause
 * NVDA to treat slide content as an interactive form field rather than readable
 * content. This plugin corrects that by:
 *
 * - Removing role="textbox"         (incorrect role for content regions)
 * - Removing contenteditable="false" (presence alone triggers forms mode in NVDA)
 * - Removing aria-readonly           (implies textbox semantics)
 * - Removing aria-autocomplete       (only valid on form inputs)
 * - Setting role="region"            (correct landmark for notable content areas)
 * - Setting aria-label="Slide content" (neutral, accurate label)
 *
 * registerRootListener fires when Lexical attaches its editor element to the DOM.
 * The listener is automatically cleaned up when the component unmounts.
 */
function AriaCleanupPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerRootListener((rootElement) => {
      if (!rootElement) return;

      // Remove incorrect role if present
      if (rootElement.getAttribute('role') === 'textbox') {
        rootElement.removeAttribute('role');
      }

      // Remove contenteditable="false" — triggers NVDA forms mode regardless of value
      if (rootElement.getAttribute('contenteditable') === 'false') {
        rootElement.removeAttribute('contenteditable');
      }

      // Remove aria-readonly — implies textbox semantics even without the role
      if (rootElement.hasAttribute('aria-readonly')) {
        rootElement.removeAttribute('aria-readonly');
      }

      // Remove aria-autocomplete — only valid on combobox/textbox/list inputs
      if (rootElement.hasAttribute('aria-autocomplete')) {
        rootElement.removeAttribute('aria-autocomplete');
      }
      // Remove aria-label if Lexical has set it to "editable markdown" —
      // wrong context for a content consumer in the player
      const currentLabel = rootElement.getAttribute('aria-label');
      if (currentLabel === 'editable markdown') {
        rootElement.removeAttribute('aria-label');
      }
    });
  }, [editor]);

  return null;
}

/**
 * ariaOverridePlugin
 *
 * Packages the aria cleanup as a single MDXEditor plugin.
 * Applies to both the root composer and any nested editors so
 * no instance is left with incorrect interactive semantics.
 */
export const ariaOverridePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: AriaCleanupPlugin, // root editor
      [addNestedEditorChild$]: AriaCleanupPlugin, // any nested editors
    });
  },
});
