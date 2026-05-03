import {
  $isGenericHTMLNode,
  type GenericHTMLNode,
  type LexicalExportVisitor,
} from '@mdxeditor/editor';
import type * as Mdast from 'mdast';

/**
 * Visits Lexical HTML ol tag
 * visit definitions
 */
export const LexicalFootnoteHTMLVisitor: LexicalExportVisitor<
  GenericHTMLNode,
  Mdast.Html
> = {
  testLexicalNode: $isGenericHTMLNode,
  visitLexicalNode({ actions, lexicalNode, mdastParent }) {
    // we don't need to render the OL tag
    // just visit the children which are footnote definitions
    actions.visitChildren(lexicalNode, mdastParent);
  },
  priority: 1,
};
