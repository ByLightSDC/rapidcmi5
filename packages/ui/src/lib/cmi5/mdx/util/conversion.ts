import { mdxJsxFromMarkdown, mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';
import { toMarkdown } from 'mdast-util-to-markdown';
import { Nodes } from 'mdast';

/* mdast */
import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from 'mdast-util-directive';

import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { Options, Value, fromMarkdown } from 'mdast-util-from-markdown';
import { Extension } from 'micromark-util-types';

export const convertMdastToMarkdown = (tree: Nodes) => {
  const childMarkdown = toMarkdown(tree, {
    extensions: defaultToMarkdownExtensions,
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
  return childMarkdown;
};

export const convertMarkdownToMdast = (
  theMarkDown: Value,
  syntaxExtensions: Extension[],
) => {
  const theChildMDast = fromMarkdown(theMarkDown, {
    extensions: syntaxExtensions,
    mdastExtensions: [
      mdxJsxFromMarkdown(),
      directiveFromMarkdown(),
      gfmStrikethroughFromMarkdown(),
      gfmTaskListItemFromMarkdown(),
      gfmTableFromMarkdown(),
    ],
  });
  return theChildMDast;
};

/**
 * Convenient list of extensions supported in our editor
 * when you add a plugin, add the appropriate extensions here
 */
export const defaultToMarkdownExtensions = [
  directiveToMarkdown(),
  mdxJsxToMarkdown(),
  gfmStrikethroughToMarkdown(),
  frontmatterToMarkdown('yaml'),
  gfmTaskListItemToMarkdown(),
  gfmTableToMarkdown(),
];
