import * as Mdast from 'mdast';
import { TableNode, $isTableNode } from './TableNode';
import { LexicalExportVisitor } from '@mdxeditor/editor';
import { toHast } from 'mdast-util-to-hast';
import { toHtml } from 'hast-util-to-html';
import type { Element } from 'hast';
import { CONTENT_WIDTH_MAP } from '../../../../styles/lessonThemeStyles';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

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
      // 1. Extract style and text-align from our custom data storage
      let style = cell.data?.hProperties?.['style'] as string | undefined;
      const textAlign = (cell.data?.hProperties as any)?.['data-text-align'] as string | undefined;
      const properties: any = {};

      // Strip transparent background-color so it doesn't override CSS stripe rules in the player
      if (style) {
        style = style.replace(/background-color:\s*transparent\s*;?/i, '').trim().replace(/;$/, '').trim() || undefined;
      }

      // Merge text-align into the style string so it round-trips through HTML
      const styleWithAlign = [
        style,
        textAlign && textAlign !== 'left' ? `text-align: ${textAlign}` : undefined,
      ].filter(Boolean).join('; ');

      if (styleWithAlign) {
        properties.style = styleWithAlign;
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

      // 3. Build hProperties without contentWidth (don't put it on the <table> element)
      const hProps = { ...(mdastNode.data?.hProperties || {}) } as Record<string, unknown>;
      const contentWidth = hProps['contentWidth'] as ContentWidthEnum | undefined;
      delete hProps['contentWidth'];

      // If striped rows are enabled, expose colors as CSS custom properties so
      // the player's :nth-child rules can consume them via var().
      if (hProps['data-striped'] === 'true') {
        const existingStyle = (hProps['style'] as string) || '';
        const stripeVars = `--stripe-odd: ${hProps['data-stripe-odd'] || '#d6e4f7'}; --stripe-even: ${hProps['data-stripe-even'] || '#ffffff'};`;
        hProps['style'] = existingStyle ? `${existingStyle} ${stripeVars}` : stripeVars;
      }

      // 4. Wrap in Table
      const tableHast: Element = {
        type: 'element',
        tagName: 'table',
        properties: {
          ...hProps,
          className: ['rc5-table'],
        },
        children: tableChildren,
      };

      // 5. Convert HAST to HTML String
      let htmlString = toHtml(tableHast, { allowDangerousHtml: true });

      // 6. Wrap in a constraining div when contentWidth is set
      if (contentWidth !== undefined) {
        const maxWidth = CONTENT_WIDTH_MAP[contentWidth];
        const style = maxWidth
          ? `max-width: ${maxWidth}; margin-left: auto; margin-right: auto;`
          : '';
        htmlString = `<div class="rc5-table-container"${style ? ` style="${style}"` : ''}>${htmlString}</div>`;
      }

      // 7. Append as an HTML node
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: htmlString,
      });
    },
  };
