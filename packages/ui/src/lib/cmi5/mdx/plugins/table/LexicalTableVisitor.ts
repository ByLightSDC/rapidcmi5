import * as Mdast from 'mdast';
import { TableNode, $isTableNode } from './TableNode';
import { LexicalExportVisitor } from '@mdxeditor/editor';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
import type { Element } from 'hast';

/**
 * Manually converts a Table Row Mdast node to a HAST <tr> element
 * preserving styles and structure.
 */
function rowToHast(
  row: Mdast.TableRow,
  tagName: 'td' | 'th'
): Element {
  return {
    type: 'element',
    tagName: 'tr',
    properties: {},
    children: row.children.map((cell) => {
      // 1. Extract style from our custom data storage
      const style = cell.data?.hProperties?.['style'];
      const properties: any = {};
      if (style) {
        properties.style = style;
      }

      // 2. Convert cell content to HAST
      const cellChildrenHast: any[] = [];

      cell.children.forEach((child) => {
        // cast to unknown first to bypass strict overlap check
        if ((child as any).type === 'paragraph') {
          // If it's a paragraph, convert ITS children (the text) instead of the <p> tag
          const pNode = child as unknown as Mdast.Paragraph;

          const pChildren = pNode.children.map(pChild =>
            toHast(pChild, { allowDangerousHtml: true })
          );
          cellChildrenHast.push(...pChildren);
        } else {
          // otherwise convert the node normally
          cellChildrenHast.push(toHast(child, { allowDangerousHtml: true }));
        }
      });

      // filter out any nulls/undefineds
      const validChildren = cellChildrenHast.filter(Boolean);

      // 3. Create the TH/TD element
      return {
        type: 'element',
        tagName: tagName,
        properties: properties,
        children: validChildren,
      };
    }),
  };
}

export const LexicalTableVisitor: LexicalExportVisitor<TableNode, Mdast.HTML> =
  {
    testLexicalNode: $isTableNode,
    visitLexicalNode({ actions, mdastParent, lexicalNode }) {
      const mdastNode = lexicalNode.getMdastNode();
      const rows = mdastNode.children;

      if (rows.length === 0) return;

      // --- MANUAL HAST CONSTRUCTION ---

      const tableChildren: Element[] = [];

      // 1. Handle Header (First Row)
      if (rows.length > 0) {
        const headerRow = rows[0];
        const headerHast = rowToHast(headerRow, 'th');

        tableChildren.push({
          type: 'element',
          tagName: 'thead',
          properties: {},
          children: [headerHast],
        });
      }

      // 2. Handle Body (Remaining Rows)
      if (rows.length > 1) {
        const bodyRows = rows.slice(1);
        const bodyHastChildren = bodyRows.map(row => rowToHast(row, 'td'));

        tableChildren.push({
          type: 'element',
          tagName: 'tbody',
          properties: {},
          children: bodyHastChildren,
        });
      }

      // 3. Wrap in Table
      const tableHast: Element = {
        type: 'element',
        tagName: 'table',
        properties: {},
        children: tableChildren,
      };

      // 4. Convert HAST to HTML String
      const htmlString = toHtml(tableHast, { allowDangerousHtml: true });

      // 5. Append as an HTML node
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: htmlString,
      });
    },
  };
