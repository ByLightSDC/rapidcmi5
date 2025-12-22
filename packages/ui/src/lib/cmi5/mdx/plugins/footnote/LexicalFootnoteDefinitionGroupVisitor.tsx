import { LexicalExportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';

import { FootnoteDefinitionGroupNode } from './FootnoteDefinitionGroupNode';
import { $isFootnoteDefinitionGroupNode } from './methods';

/**
 * Visits Lexical Footnote Definitions Group
 * steps into children
 */
export const LexicalFootnoteDefinitionGroupVisitor: LexicalExportVisitor<
  FootnoteDefinitionGroupNode,
  Mdast.Html
> = {
  testLexicalNode: $isFootnoteDefinitionGroupNode,
  visitLexicalNode: ({ lexicalNode, mdastParent, actions }) => {
    //console.log('visit lex group');

    // we dont need any markdown representation of the group in markdown
    // so just visit the <ol> element
    actions.visit(lexicalNode.getChildren()?.[0], mdastParent);
  },
  priority: 1,
};
