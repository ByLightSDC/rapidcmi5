import * as Mdast from 'mdast';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { ElementNode } from 'lexical';
import { $createTableNode } from './TableNode';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

type HtmlNode = Mdast.Html;

function parseRows(tbody: Element): Mdast.TableRow[] {
  const rows: Mdast.TableRow[] = [];
  for (const tr of Array.from(tbody.querySelectorAll(':scope > tr'))) {
    const cells: Mdast.TableCell[] = [];
    for (const cell of Array.from(tr.querySelectorAll(':scope > td, :scope > th'))) {
      const styleAttr = cell.getAttribute('style') ?? '';
      const textAlignMatch = styleAttr.match(/text-align:\s*(left|center|right)/i);
      const textAlign = textAlignMatch ? textAlignMatch[1] : undefined;
      const strippedStyle = styleAttr
        .replace(/;?\s*text-align:\s*(left|center|right)\s*/i, '')
        .replace(/^;\s*/, '')
        .trim();
      const hProperties: Record<string, string> = {};
      if (strippedStyle) hProperties['style'] = strippedStyle;
      if (textAlign && textAlign !== 'left') hProperties['data-text-align'] = textAlign;

      cells.push({
        type: 'tableCell',
        children: [{ type: 'text', value: cell.textContent ?? '' }],
        data: Object.keys(hProperties).length > 0 ? { hProperties } : undefined,
      });
    }
    if (cells.length > 0) rows.push({ type: 'tableRow', children: cells });
  }
  return rows;
}

export const MdastHtmlTableVisitor: MdastImportVisitor<HtmlNode> = {
  testNode: (node) =>
    node.type === 'html' &&
    (node.value.includes('class="rc5-table"') || node.value.includes("class='rc5-table'")),

  visitNode({ mdastNode, lexicalParent }) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mdastNode.value, 'text/html');

    const table = doc.querySelector('table.rc5-table');
    if (!table) return;

    const contentWidthAttr = table.getAttribute('data-content-width') as ContentWidthEnum | null;
    const styleAttr = table.getAttribute('style') ?? undefined;

    const hProperties: Record<string, string> = {};
    if (contentWidthAttr) hProperties['contentWidth'] = contentWidthAttr;
    if (styleAttr) hProperties['style'] = styleAttr;

    // Carry through data attributes (striped rows, etc.)
    for (const attr of Array.from(table.attributes)) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-content-width') {
        hProperties[attr.name] = attr.value;
      }
    }

    const allRows: Mdast.TableRow[] = [];
    const thead = table.querySelector(':scope > thead');
    const tbody = table.querySelector(':scope > tbody');
    if (thead) allRows.push(...parseRows(thead));
    if (tbody) allRows.push(...parseRows(tbody));

    if (allRows.length === 0) return;

    const mdastTable: Mdast.Table = {
      type: 'table',
      align: [],
      children: allRows,
      data: { hProperties },
    };

    (lexicalParent as ElementNode).append($createTableNode(mdastTable));
  },
};
