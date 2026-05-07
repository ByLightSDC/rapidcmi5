import './styles/draggable-block.css';
import { $getRoot, LexicalEditor } from 'lexical';


/**
 * Utility methods for drag and drop  behavior
 */

/**
 * Walks up the DOM from `target` and returns the first element that is a
 * direct child of `editorRoot` (i.e. a top-level editor block).
 *
 * @returns The top-level block element, or `null` if `target` is not inside `editorRoot`.
 */
export const getTopLevelBlock = (
  editorRoot: HTMLElement,
  target: Element | null,
): HTMLElement | null => {
  if (!target) return null;
  let el: Element | null = target;
  while (el) {
    if (el.parentElement === editorRoot) return el as HTMLElement;
    el = el.parentElement;
    if (!el || el === editorRoot) return null;
  }
  return null;
}

/**
 * Finds the Lexical node key whose DOM element matches `domEl`.
 *
 * Iterates over root-level children in the current editor state and compares
 * each node's resolved DOM element to `domEl`.
 *
 * @returns The node key string, or `null` if no match is found.
 */
export const findKeyForDOMElement = (editor: LexicalEditor, domEl: HTMLElement): string | null => {
  let found: string | null = null;
  editor.getEditorState().read(() => {
    const root = $getRoot();
    for (const child of root.getChildren()) {
      const key = child.getKey();
      if (editor.getElementByKey(key) === domEl) {
        found = key;
        return;
      }
    }
  });
  return found;
}

/**
 * Walks up the ancestor chain of `el` looking for the nearest element with
 * `overflow-y: auto | scroll`. Falls back to `window` if none is found.
 */
export const findScrollableParent = (el: HTMLElement): HTMLElement | Window => {
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') return parent;
    parent = parent.parentElement;
  }
  return window;
}

/**
 * Scrolls `container` vertically by `delta` pixels.
 * Handles both `Window` (uses `scrollBy`) and plain `HTMLElement` (sets `scrollTop`).
 */
export const  scrollContainer = (container: HTMLElement | Window, delta: number) => {
  if (container instanceof Window) {
    container.scrollBy(0, delta);
  } else {
    container.scrollTop += delta;
  }
}