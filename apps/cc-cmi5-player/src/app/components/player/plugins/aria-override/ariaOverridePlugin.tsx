import {
  realmPlugin,
  addComposerChild$,
  addNestedEditorChild$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * Injected into the root Lexical composer.
 * Lexical hardcodes role="textbox" and aria-label="editable markdown" on its
 * editor element — even in readOnly mode. This overrides both so NVDA treats
 * the slide content as a readable region landmark rather than a form field.
 * tabindex="-1" is required to programmatically focus contenteditable="false".
 */
function RootAriaOverride(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Listen at root to grab as soon as created
    return editor.registerRootListener((rootElement) => {
      if (rootElement) {
        rootElement.setAttribute('role', 'region'); // landmark — makes slide content navigable by screen readers
        rootElement.setAttribute('aria-label', 'Slide content'); // replaces Lexical's default 'editable markdown'
        rootElement.setAttribute('tabindex', '-1'); // required for el.focus() in RC5Player.tsx
      }
    });
  }, [editor]);

  return null;
}

/**
 * Injected into every nested Lexical composer (grid cells, accordions, etc.).
 * Removes role="textbox" so NVDA does not treat nested content areas as form fields.
 */
function NestedAriaOverride(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Listen at root to grab as soon as created
    return editor.registerRootListener((rootElement) => {
      // Only remove if textbox
      if (rootElement && rootElement.getAttribute('role') === 'textbox') {
        rootElement.removeAttribute('role'); //remove it
      }
    });
  }, [editor]);

  return null;
}

// Packages both overrides as a single MDXEditor plugin.
// Add ariaOverridePlugin() to thePlugins in RC5Player.tsx.
export const ariaOverridePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: RootAriaOverride,
      [addNestedEditorChild$]: NestedAriaOverride,
    });
  },
});
