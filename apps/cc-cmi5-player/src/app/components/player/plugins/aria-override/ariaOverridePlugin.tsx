import {
  realmPlugin,
  addComposerChild$,
  addNestedEditorChild$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

/**
 * Attributes Lexical stamps onto editor roots / decorator nodes that make NVDA
 * announce non-interactive content as "clickable" or treat it as a form field.
 *
 * NVDA keys off the *presence* of `contenteditable` (even `="false"`), so the
 * attribute must be removed outright — changing `role` alone is NOT enough
 * (verified: grid cells carry role="none" and still leak while contenteditable
 * remains).
 */
function neutralizeElement(el: HTMLElement): void {
  // contenteditable="false" — the primary "clickable" trigger. Lexical hardcodes
  // this on the editor root AND on every decorator node during reconciliation
  // (lexical: "Decorators are always non editable"). Remove it wherever present.
  if (el.getAttribute('contenteditable') === 'false') {
    el.removeAttribute('contenteditable');
  }

  // role="textbox" — incorrect role for a read-only content region.
  if (el.getAttribute('role') === 'textbox') {
    el.removeAttribute('role');
  }

  // aria-readonly — implies textbox semantics even without the role.
  if (el.hasAttribute('aria-readonly')) {
    el.removeAttribute('aria-readonly');
  }

  // aria-autocomplete — only valid on combobox/textbox/list inputs.
  if (el.hasAttribute('aria-autocomplete')) {
    el.removeAttribute('aria-autocomplete');
  }

  // aria-label="editable markdown" — wrong context for a content consumer.
  if (el.getAttribute('aria-label') === 'editable markdown') {
    el.removeAttribute('aria-label');
  }
}

/**
 * Neutralize the given root and every descendant that carries contenteditable.
 * Covers Source 1 (the Lexical editor root) and Source 2 (decorator nodes),
 * which registerRootListener alone can never reach.
 */
function neutralizeSubtree(root: HTMLElement): void {
  neutralizeElement(root);
  root
    .querySelectorAll<HTMLElement>('[contenteditable="false"]')
    .forEach(neutralizeElement);
}

/**
 * AriaCleanupPlugin (internal component)
 *
 * Injected into both the root and every nested Lexical composer.
 *
 * Lexical stamps `contenteditable="false"` (plus textbox role / aria-readonly /
 * aria-autocomplete) onto editor roots and every decorator node. NVDA reports
 * these as "clickable", so plain slide content reads as interactive.
 *
 * The previous implementation used a one-shot `registerRootListener` which:
 *   1. only saw the editor ROOT — never the decorator descendants (half the
 *      leaks), and
 *   2. removed the attribute once, but Lexical re-applies it on every
 *      reconciliation, so it silently came back.
 *
 * This version installs a persistent MutationObserver over the editor subtree
 * that re-neutralizes root + decorator nodes whenever Lexical re-adds the
 * attribute or mounts new decorator content (e.g. expanding an accordion/tab).
 * One install point, applied to root + every nested editor, so it stays
 * consistent across all directives and both nested-editor forks.
 */
function AriaCleanupPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let observer: MutationObserver | null = null;

    const unregister = editor.registerRootListener(
      (rootElement: HTMLElement | null) => {
        // Tear down any observer bound to a previous root element.
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (!rootElement) return;

        // Initial pass so content is clean before the first paint / read.
        neutralizeSubtree(rootElement);

        // Persistent guard: Lexical re-stamps contenteditable on every reconcile
        // and when new decorator nodes mount. Re-neutralize on any relevant change.
        observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (
              m.type === 'attributes' &&
              m.target instanceof HTMLElement
            ) {
              neutralizeElement(m.target);
            } else if (m.type === 'childList') {
              m.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                  neutralizeSubtree(node);
                }
              });
            }
          }
        });

        observer.observe(rootElement, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: [
            'contenteditable',
            'role',
            'aria-readonly',
            'aria-autocomplete',
            'aria-label',
          ],
        });
      },
    );

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      unregister();
    };
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
