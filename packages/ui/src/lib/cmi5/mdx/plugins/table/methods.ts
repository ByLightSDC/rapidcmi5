import { Signal, map } from '@mdxeditor/gurx';
import * as Mdast from 'mdast';
import { $createTableNode, TableNode } from './TableNode';
import { insertDecoratorNode$ } from '@mdxeditor/editor';
import type {
  TableRow,
  TableCell,
} from 'mdast';

import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import { normalizeTableCellChildren } from '../../util/mdastHelpers';

function isMdxTag(node: any, tagName: string): boolean {
  return (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    node.name === tagName
  );
}

function seedTable(rows = 1, columns = 1): Mdast.Table {
  const table: Mdast.Table = {
    type: 'table',
    children: [],
  };

  for (let i = 0; i < rows; i++) {
    const tableRow: Mdast.TableRow = {
      type: 'tableRow',
      children: [],
    };

    for (let j = 0; j < columns; j++) {
      const cell: Mdast.TableCell = {
        type: 'tableCell',
        children: [],
      };
      tableRow.children.push(cell);
    }

    table.children.push(tableRow);
  }

  return table;
}

/**
 * A signal that will insert a table with the published amount of rows and columns into the active editor.
 * @group Table
 */
export const insertTable$ = Signal<{
  rows?: number;
  columns?: number;
}>((r) => {
  r.link(
    r.pipe(
      insertTable$,
      map(({ rows, columns }) => {
        return () => $createTableNode(seedTable(rows, columns));
      }),
    ),
    insertDecoratorNode$,
  );
});

/**
 * Return mdast table rows from html element (MdxJsx).
 * Accept both Flow (Block) and Text (Inline) elements.
 */
export function extractRows(tableNode: MdxJsxFlowElement | MdxJsxTextElement): TableRow[] {
  const rows: TableRow[] = [];

  for (const child of tableNode.children) {
    // direct TR child
    if (isMdxTag(child, 'tr')) {
      rows.push({
        type: 'tableRow',
        children: extractRowContent(child as MdxJsxFlowElement) as TableCell[],
      });
    }
    // sections (thead, tbody, tfoot): Unwrap them to find their TRs
    else if (isMdxTag(child, 'thead') || isMdxTag(child, 'tbody') || isMdxTag(child, 'tfoot')) {
      const nestedRows = extractRows(child as MdxJsxFlowElement);
      rows.push(...nestedRows);
    }
  }

  return rows;
}

/** Return mdast table content from table row */
function extractRowContent(
  trNode: MdxJsxFlowElement | Mdast.Paragraph,
): TableCell[] {
  const results: TableCell[] = [];

  for (const child of trNode.children) {
    // 1. <td> or <th>
    if (isMdxTag(child, 'td') || isMdxTag(child, 'th')) {

      const elt = child as (MdxJsxFlowElement | MdxJsxTextElement);
      let data = undefined;

      if (elt.attributes) {
        const styleAttr = elt.attributes.find(
          (a) => a.type === 'mdxJsxAttribute' && a.name === 'style'
        );

        if (styleAttr && typeof styleAttr.value === 'string') {
          data = { hProperties: { style: styleAttr.value } };
        }
      }

      results.push({
        type: 'tableCell',
        // cast to any to bypass strict type check
        children: normalizeTableCellChildren(elt.children as any),
        data: data,
      });
      continue;
    }

    // 2. <tr> nested INSIDE a paragraph (rare edge case)
    if (isMdxTag(child, 'tr')) {
      const nestedCells = extractRowContent(child as MdxJsxFlowElement);
      results.push(...nestedCells);
      continue;
    }

    // 3. Paragraph -> recursive search inside it
    if (child.type === 'paragraph') {
      const nested = extractRowContent(child);
      results.push(...nested);
      continue;
    }
  }

  return results;
}
