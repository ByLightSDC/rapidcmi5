/*
 * Copyright (c) 2025 By Light Professional IT Services LLC
 * All rights reserved.
 */
import * as Mdast from 'mdast';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx';
import { RootNode } from 'lexical';
import { $createTableNode } from './TableNode';
import { extractRows } from './methods';

export const MdastJsxTableVisitor: MdastImportVisitor<MdxJsxFlowElement | MdxJsxTextElement> = {
  testNode: (node) => {
    // match both 'mdxJsxFlowElement' (Block) AND 'mdxJsxTextElement' (Inline)
    return (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === 'table';
  },
  visitNode({ mdastNode, lexicalParent }) {
    // console.log('MdastJsxTableVisitor', mdastNode);

    // Convert children into mdast table rows + cells
    const rows = extractRows(mdastNode);

    const tableNode: Mdast.Table = {
      type: 'table',
      align: [],
      children: rows,
    };

    const table = $createTableNode(tableNode);
    //console.log('NEW create table node here', table);
    (lexicalParent as RootNode).append(table);
  },
};
