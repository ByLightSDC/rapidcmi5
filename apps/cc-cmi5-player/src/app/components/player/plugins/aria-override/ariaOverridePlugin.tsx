import {
  realmPlugin,
  addComposerChild$,
  addNestedEditorChild$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * RemoveTextboxRole
 *
 * Injected into both the root and every nested Lexical composer.
 * Lexical hardcodes role="textbox" on its editor element, even in readOnly mode.
 * This causes NVDA to treat slide content and nested elements as form fields,
 * which is incorrect and disruptive for screen reader users.
 *
 * This registers a root listener that fires whenever Lexical attaches its editor
 * element to the DOM. If role="textbox" is present, it is removed immediately..
 *
 * The listener is automatically cleaned up when the component unmounts.
 */
function RemoveTextboxRole(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // registerRootListener fires when Lexical mounts its editor DOM element.
    return editor.registerRootListener((rootElement) => {
      // Only remove the attribute if Lexical actually set it —
      // avoids touching elements that don't have it.
      if (rootElement && rootElement.getAttribute('role') === 'textbox') {
        rootElement.removeAttribute('role');
      }
    });
  }, [editor]);

  return null;
}

/**
 * ariaOverridePlugint
 *
 * Packages the RemoveTextboxRole fix as a single MDXEditor plugin.
 * Applies to both the root composer and any nested editors (e.g. editors
 * inside other editors) so no instance is left with the incorrect role.
 */
export const ariaOverridePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: RemoveTextboxRole, // root editor
      [addNestedEditorChild$]: RemoveTextboxRole, // any nested editors
    });
  },
});
