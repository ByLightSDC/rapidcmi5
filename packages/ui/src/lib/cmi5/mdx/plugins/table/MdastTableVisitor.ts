import { ElementNode } from 'lexical';
import * as Mdast from 'mdast';
//import { MdastImportVisitor } from '../../importMarkdownToLexical'
import { $createTableNode } from './TableNode';
import { MdastImportVisitor } from '@mdxeditor/editor';

export const MdastTableVisitor: MdastImportVisitor<Mdast.Table> = {
  testNode: 'table',
  visitNode({ mdastNode, lexicalParent }) {
    console.log('MdastTableVisitor', mdastNode);
    (lexicalParent as ElementNode).append($createTableNode(mdastNode));
  },
};
