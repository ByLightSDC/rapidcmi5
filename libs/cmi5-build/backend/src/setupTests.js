jest.mock('mdast-util-directive', () => ({
  __esModule: true,
  directiveFromMarkdown: jest.fn(() => ({})),
  directiveToMarkdown: jest.fn(() => ({})),
  directive: jest.fn(() => ({})),
}));

jest.mock('mdast-util-from-markdown', () => ({
  __esModule: true,
  fromMarkdown: jest.fn(() => ({})),
}));

jest.mock('micromark-extension-directive', () => ({
  __esModule: true,
  fromMarkdown: jest.fn(() => ({})),
}));

jest.mock('monaco-editor', () => ({
  __esModule: true,
  editor: {
    create: jest.fn(),
  },
}));

jest.mock(
  'mdast-util-mdx-jsx',
  () => ({
    __esModule: true,
    mdxJsxFromMarkdown: jest.fn(),
    mdxJsxToMarkdown: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('mdast-util-mdx-jsx', () => ({
  __esModule: true,
  mdxJsxFromMarkdown: jest.fn(),
  mdxJsxToMarkdown: jest.fn(),
}));

jest.mock('mdast-util-gfm-strikethrough', () => ({
  __esModule: true,
  gfmStrikethroughFromMarkdown: jest.fn(),
  gfmStrikethroughToMarkdown: jest.fn(),
}));

jest.mock('mdast-util-frontmatter', () => ({
  __esModule: true,
  frontmatterFromMarkdown: jest.fn(),
  frontmatterToMarkdown: jest.fn(),
}));

jest.mock('mdast-util-gfm-task-list-item', () => ({
  __esModule: true,
  gfmTaskListItemFromMarkdown: jest.fn(),
  gfmTaskListItemToMarkdown: jest.fn(),
}));

jest.mock('mdast-util-gfm-table', () => ({
  __esModule: true,
  gfmTable: jest.fn(),
}));

jest.mock('micromark-extension-gfm-task-list-item', () => ({
  __esModule: true,
  gfmTaskListItem: jest.fn(),
}));

jest.mock('micromark-extension-mdx-jsx', () => ({
  __esModule: true,
  mdxJsx: jest.fn(),
}));

jest.mock('micromark-extension-mdx-md', () => ({
  __esModule: true,
  mdxMd: jest.fn(),
}));

jest.mock('micromark-extension-gfm-table', () => ({
  __esModule: true,
  gfmTable: jest.fn(),
}));

jest.mock('mdast-util-to-markdown', () => ({
  __esModule: true,
  toMarkdown: jest.fn(),
}));

jest.mock('micromark-extension-frontmatter', () => ({
  __esModule: true,
  frontmatter: jest.fn(),
}));
