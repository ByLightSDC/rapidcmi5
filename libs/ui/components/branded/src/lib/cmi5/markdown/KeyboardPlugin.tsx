import { visit, SKIP, CONTINUE } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Text, Root, Html } from 'mdast';

/**
 * HTML escape a string.
 * @param unsafe
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * This custom remark plugin searches for anything bound by ++ on each side and
 * surrounds the content with <kbd> tags.
 * If the content contains any + symbols, the content is split up into multiple
 * <kbd> tags.
 * Example 1: ++foo++
 *            becomes
 *            <kbd>foo</kbd>
 * Example 2: ++ctrl+alt+del++
 *            becomes
 *            <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>del</kbd>
 */
export const remarkKeyboardPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index?: number, parent?: any) => {
      // ensure we have a valid parent and index
      if (parent === undefined || index === undefined) {
        return;
      }

      const regex = /\+\+(.+?)\+\+/g;
      let lastIndex = 0;
      const newChildren: (Text | Html)[] = []; // array of the new nodes
      let match: RegExpExecArray | null;

      // find all matches in the current text node's value
      while ((match = regex.exec(node.value)) !== null) {
        const precedingText = node.value.slice(lastIndex, match.index);
        const kbdContent = match[1]; // the content inside ++ ++

        // split the content by '+', trim whitespace, filter empty strings, and wrap each part
        const keys = kbdContent
          .split('+')
          .map(key => key.trim())
          .filter(key => key.length > 0); // remove potential empty strings if user types "++ctrl++alt++"

        // create the final HTML string like <kbd>key1</kbd>+<kbd>key2</kbd>
        const transformedHtmlContent = keys
          .map(key => `<kbd>${escapeHtml(key)}</kbd>`) // wrap each key, escaping basic HTML chars
          .join('+'); // Join them back with '+'

        // add the text before the match (if any)
        if (precedingText) {
          newChildren.push({ type: 'text', value: precedingText });
        }

        // create and add the <kbd> HTML node
        if (transformedHtmlContent) {
          newChildren.push({ type: 'html', value: transformedHtmlContent });
        }

        lastIndex = regex.lastIndex; // update the index for the next search
      }

      // if any replacements were made...
      if (newChildren.length > 0) {
        // add any remaining text after the last match
        const remainingText = node.value.slice(lastIndex);
        if (remainingText) {
          newChildren.push({ type: 'text', value: remainingText });
        }

        // replace the original text node with the new sequence of text and HTML nodes
        parent.children.splice(index, 1, ...newChildren);

        // return the index of the next node to check
        return [SKIP, index + newChildren.length];
      }

      // if no matches found in this node, continue visiting other nodes
      return CONTINUE;
    });
  };
};
