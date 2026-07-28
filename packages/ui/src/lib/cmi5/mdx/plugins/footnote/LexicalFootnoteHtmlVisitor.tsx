import {
  $isGenericHTMLNode,
  GenericHTMLNode,
  LexicalExportVisitor,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';

/**
 * Visits Lexical HTML ol tag
 * visit definitions
 *
 * NOTE: this must ONLY match the footnote definition `<ol>` wrapper. It
 * previously tested `$isGenericHTMLNode` (ANY GenericHTMLNode) at priority 1,
 * which silently swallowed every other raw HTML element — e.g. `<span lang>` —
 * emitting only their children and dropping tag + attributes. Scope it to `ol`
 * so other generic HTML elements fall through to their own visitors.
 */
export const LexicalFootnoteHTMLVisitor: LexicalExportVisitor<
  GenericHTMLNode,
  Mdast.Html
> = {
  testLexicalNode: (node): node is GenericHTMLNode =>
    $isGenericHTMLNode(node) && node.getTag() === 'ol',
  visitLexicalNode({ actions, lexicalNode, mdastParent }) {
    // we don't need to render the OL tag
    // just visit the children which are footnote definitions
    actions.visitChildren(lexicalNode, mdastParent);
  },
  priority: 1,
};
