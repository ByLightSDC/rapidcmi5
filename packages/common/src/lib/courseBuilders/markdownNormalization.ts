import { mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';
import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { gfmTable } from 'micromark-extension-gfm-table';
import { frontmatter } from 'micromark-extension-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { SKIP, visit } from 'unist-util-visit';

const allowedHtmlTags = new Set([
  'div',
  'b',
  'p',
  'strong',
  'mark',
  'a',
  'img',
  'br',
  'sup',
  'u',
]);

function getTagName(value: string) {
  return value
    .trim()
    .replace(/^<\/?\s*|\s*\/?>$/g, '') // remove <, </, >, />
    .split(/\s+/)[0] // take first chunk before any space
    .toLowerCase(); // normalize case
}

export function parseToMdast(input: string) {
  const tree = fromMarkdown(input, {
    extensions: [frontmatter(), gfmTaskListItem(), gfmTable()],
    mdastExtensions: [
      gfmStrikethroughFromMarkdown(),
      frontmatterFromMarkdown('yaml'),
      gfmTaskListItemFromMarkdown(),
      gfmTableFromMarkdown(),
    ],
  });

  visit(tree, (node, index, parent) => {
    if (node.type === 'link') {
      try {
        const u = new URL(node.url);
        if (u.protocol === 'mailto:') {
          node.title = u.pathname;
        } else {
          node.title = u.hostname.replace(/^www\./, '');
        }
      } catch {
        // non-URL (relative, etc.) — fall back below
      }

      if (!node.title) {
        const child = node.children?.[0];
        node.title = child?.type === 'text' ? child.value : 'link';
      }
    }
    if (node.type === 'html' && parent && index != null) {
      const s = node.value || '';

      const tagname = getTagName(s);
      if (!allowedHtmlTags.has(tagname)) {
        parent.children.splice(index, 1, { type: 'text', value: s });
        return [SKIP, index + 1];
      }
    }
    return;
  });

  const md = toMarkdown(tree, {
    extensions: [
      mdxJsxToMarkdown(),
      gfmStrikethroughToMarkdown(),
      frontmatterToMarkdown('yaml'),
      gfmTaskListItemToMarkdown(),
      gfmTableToMarkdown(),
    ],
    bullet: '-',
    unsafe: [
      {
        character: '<',
        inConstruct: [
          'phrasing',
          'paragraph',
          'mdxJsxFlowElement',
          'mdxJsxTextElement',
          'containerDirective',
          'tableCell',
        ],
      },
      {
        character: ':',
        inConstruct: ['phrasing', 'paragraph', 'mdxJsxFlowElement'],
      },
    ],
  });

  return md;
}

export function cleanMkdocsRawText(content: string) {
  let cleaned = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/br\s*>/gi, '');

  cleaned = cleaned.replaceAll('quizdownb.init();', '');

  cleaned = cleaned
    .replaceAll('<li>', '- ')
    .replaceAll('</li>', '')
    .replaceAll('<ul>', '')
    .replaceAll('</ul>', '');

  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');

  cleaned = cleaned.replace(
    /!\[([^\]]*)\]\((.*?)\)\{\:\s*style="height:(\d+)px;?"\s*\}/g,
    (_match, alt = '', src = '', height = '') =>
      `<img height="${height}" src="${src}" />`,
  );

  cleaned = cleaned.replace(
    /!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)/g,
    (_match, alt, url) => {
      return `<img src="${url}" alt="${alt}" height="500"/>`;
    },
  );

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  cleaned = cleaned.replace(/<head>[\s\S]*?<\/head>/gi, '');
  return cleaned;
}
