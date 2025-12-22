jest.mock('mdast-util-directive', () => ({
  __esModule: true,
  directiveFromMarkdown: jest.fn(() => ({})),
  directiveToMarkdown: jest.fn(() => ({})),
  directive: jest.fn(() => ({})),
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

jest.mock('mdast-util-gfm-strikethrough', () => ({
  __esModule: true,
  gfmStrikethroughFromMarkdown: jest.fn(),
  gfmStrikethroughToMarkdown: jest.fn(),
}));
