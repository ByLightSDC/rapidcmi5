import {
  realmPlugin,
  addComposerChild$,
  addNestedEditorChild$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * Applies the same corrections to a Lexical root element, whether it's the
 * initial mount or a re-application triggered by the MutationObserver below.
 */
function applyAriaFixes(rootElement: HTMLElement) {
  // Replace Lexical's incorrect role with document — tells NVDA to use
  // browse/reading mode instead of forms mode or treating content as clickable.
  // Guarded so a no-op setAttribute doesn't queue a mutation record (this fn
  // is also called by the MutationObserver below, on every correction).
  if (rootElement.getAttribute('role') !== 'document') {
    rootElement.setAttribute('role', 'document');
  }

  // NOTE: contenteditable="false" is intentionally left alone here (unlike an
  // earlier version of this fix, which stripped it). Lexical keeps real click
  // listeners registered on the root even in read-only mode (for links,
  // checkbox lists, etc.); contenteditable="false" appears to be the signal
  // Chrome's accessibility tree uses to treat this subtree as a sealed
  // non-interactive boundary and stop exposing those listeners to descendants
  // as "clickable". Removing the attribute removed that boundary — Chrome
  // doesn't recompute the exposure immediately, so it read clean until a
  // focus-out/focus-in on the document forced a recompute, at which point
  // every descendant started reading as clickable again. role="document"
  // below is what actually fixes NVDA forms-mode; contenteditable doesn't
  // need to be touched for that.

  // Remove aria-readonly — implies textbox semantics even without the role
  if (rootElement.hasAttribute('aria-readonly')) {
    rootElement.removeAttribute('aria-readonly');
  }

  // Remove aria-autocomplete — only valid on combobox/textbox/list inputs
  if (rootElement.hasAttribute('aria-autocomplete')) {
    rootElement.removeAttribute('aria-autocomplete');
  }

  // Remove spellcheck — browser keeps this "true" by default on contenteditable elements
  if (rootElement.getAttribute('spellcheck') !== 'false') {
    rootElement.setAttribute('spellcheck', 'false');
  }

  // Remove aria-label if Lexical has set it to "editable markdown" —
  // wrong context for a content consumer in the player
  const currentLabel = rootElement.getAttribute('aria-label');
  if (currentLabel === 'editable markdown') {
    rootElement.removeAttribute('aria-label');
  }
}

// Lexical's ContentEditable renders contenteditable, aria-readonly, and
// aria-autocomplete all from the same isEditable state (role and spellCheck
// are not tied to it). When a nested editor's editable state is corrected
// from true to false one tick after mount, React re-renders all three
// together. contenteditable itself is left alone (see the note in
// applyAriaFixes above) and settles on "false" via Lexical's own logic, but
// aria-readonly/aria-autocomplete still need to be watched and stripped each
// time they're rewritten.
const WATCHED_ATTRIBUTES = ['aria-readonly', 'aria-autocomplete'];

/**
 * AriaCleanupPlugin (internal component)
 *
 * Injected into both the root and every nested Lexical composer.
 *
 * Lexical hardcodes several ARIA attributes on its editor element that cause
 * NVDA to treat slide content as an interactive form field rather than readable
 * content. applyAriaFixes corrects that on every root element Lexical attaches.
 *
 * registerRootListener fires once when an editor's root element first mounts,
 * and again only if that root element is swapped for a different DOM node.
 * It does NOT fire again when a nested editor's own contentEditable prop is
 * later flipped by React (no new node, so no new ref, so no new listener
 * call) — and freshly-created nested editors (quotes, grid cells, etc.) do
 * exactly that one tick after mount: they're born editable=true, then their
 * parent composer corrects them to editable=false via a React state update,
 * which re-renders contenteditable="false" (and aria-readonly/aria-autocomplete
 * alongside it) onto the existing node after our listener already ran. The
 * MutationObserver below is scoped to WATCHED_ATTRIBUTES on this one node, so
 * it stays idle except to catch that single delayed correction — it isn't
 * polling or watching the wider subtree.
 */
function AriaCleanupPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let observer: MutationObserver | null = null;

    return editor.registerRootListener((rootElement) => {
      observer?.disconnect();
      observer = null;

      if (!rootElement) return;

      applyAriaFixes(rootElement);

      observer = new MutationObserver(() => {
        applyAriaFixes(rootElement);
      });
      observer.observe(rootElement, {
        attributes: true,
        attributeFilter: WATCHED_ATTRIBUTES,
      });
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
