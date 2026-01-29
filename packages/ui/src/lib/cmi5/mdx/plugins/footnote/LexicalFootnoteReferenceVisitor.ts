import { LexicalExportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';
import { $isFootnoteReferenceNode } from './methods';

/**
 * Visits Lexical Reference tag
 * adds serialized data to mdast
 */
export const LexicalFootnoteReferenceVisitor: LexicalExportVisitor<
  FootnoteReferenceNode,
  Mdast.FootnoteReference
> = {
  testLexicalNode: $isFootnoteReferenceNode,
  visitLexicalNode: ({ lexicalNode, mdastParent, actions }) => {
    actions.appendToParent(mdastParent, {
      type: 'footnoteReference',
      identifier: lexicalNode.getLabel(), //this is probably the number
      label: lexicalNode.getLabel(),
    });
  },
  priority: 1,
};
