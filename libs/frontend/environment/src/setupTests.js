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

jest.mock('mdast-util-math', () => ({
  __esModule: true,
  mathFromMarkdown: jest.fn(),
  mathToMarkdown: jest.fn(),
}));

jest.mock('micromark-extension-math', () => ({
  __esModule: true,
  math: jest.fn(),
  mathHtml: jest.fn(),
}));
