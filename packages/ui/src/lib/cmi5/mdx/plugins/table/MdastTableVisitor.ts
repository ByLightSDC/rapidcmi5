import { type ElementNode } from 'lexical';
import type * as Mdast from 'mdast';
//import { MdastImportVisitor } from '../../importMarkdownToLexical'
import { $createTableNode } from './TableNode';
import { type MdastImportVisitor } from '@mdxeditor/editor';

export const MdastTableVisitor: MdastImportVisitor<Mdast.Table> = {
  testNode: 'table',
  visitNode({ mdastNode, lexicalParent }) {
    console.log('MdastTableVisitor', mdastNode);
    (lexicalParent as ElementNode).append($createTableNode(mdastNode));
  },
};
