import { LexicalExportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';
import { $isFootnoteDefinitionNode } from './methods';

/**
 * Visits Lexical Footnote Definition
 * adds serialized data to mdast including children
 */
export const LexicalFootnoteDefinitionVisitor: LexicalExportVisitor<
  FootnoteDefinitionNode,
  Mdast.FootnoteDefinition
> = {
  testLexicalNode: $isFootnoteDefinitionNode,
  visitLexicalNode: ({ lexicalNode, mdastParent, actions }) => {
    actions.appendToParent(mdastParent, {
      type: 'footnoteDefinition',
      identifier: lexicalNode.getLabel(),
      label: lexicalNode.getLabel(),
      children: lexicalNode.getMdastNode().children,
    });
  },
  priority: 1,
};
