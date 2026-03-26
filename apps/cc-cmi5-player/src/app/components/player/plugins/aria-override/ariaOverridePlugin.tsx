import { realmPlugin, addComposerChild$, addNestedEditorChild$ } from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * Injected into the root Lexical composer.
 * Replaces role="textbox" with role="region" so NVDA browses slide content
 * automatically without requiring the user to enter a form field.
 * tabindex="-1" is required to programmatically focus contenteditable="false".
 */
function RootAriaOverride(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerRootListener((rootElement) => {
      if (rootElement) {
        rootElement.setAttribute('role', 'region');
        rootElement.setAttribute('aria-label', 'Slide content');
        rootElement.setAttribute('tabindex', '-1');
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
    return editor.registerRootListener((rootElement) => {
      if (rootElement) {
        rootElement.removeAttribute('role');
      }
    });
  }, [editor]);

  return null;
}

export const ariaOverridePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: RootAriaOverride,
      [addNestedEditorChild$]: NestedAriaOverride,
    });
  },
});
