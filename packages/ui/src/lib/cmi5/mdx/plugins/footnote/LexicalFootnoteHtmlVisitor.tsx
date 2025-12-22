import {
  $isGenericHTMLNode,
  GenericHTMLNode,
  LexicalExportVisitor,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';

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
