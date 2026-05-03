/*
 * Copyright (c) 2025 By Light Professional IT Services LLC
 * All rights reserved.
 */
import type * as Mdast from 'mdast';
import { type MdastImportVisitor } from '@mdxeditor/editor';
import { type MdxJsxTextElement, type MdxJsxFlowElement } from 'mdast-util-mdx';
import { type RootNode } from 'lexical';
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

    // Extract attributes
    let data = undefined;
    if (mdastNode.attributes) {
      const styleAttr = mdastNode.attributes.find(
        (a) => a.type === 'mdxJsxAttribute' && a.name === 'style'
      );

      if (styleAttr && typeof styleAttr.value === 'string') {
        data = { hProperties: { style: styleAttr.value } };
      }
    }

    const tableNode: Mdast.Table = {
      type: 'table',
      align: [],
      children: rows,
      data: data, // Pass data to node
    };

    const table = $createTableNode(tableNode);
    //console.log('NEW create table node here', table);
    (lexicalParent as RootNode).append(table);
  },
};
