import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.setTimeout(10000);

/** Jest does not handle the scrolling functions since it doesn't do full layout */
Element.prototype.scrollIntoView = jest.fn();

/*
Jest can't handle ES6 modules without turning on experimental feature
Mocking the module is easier if you don't need to test it with jest
*/

jest.mock('github-slugger', () => ({
  __esModule: true,
  default: class Slugger {},
  namedExport: jest.fn(),
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

jest.mock('mdast-util-to-markdown', () => ({
  __esModule: true,
  directiveFromMarkdown: jest.fn(() => ({})),
  directiveToMarkdown: jest.fn(() => ({})),
  directive: jest.fn(() => ({})),
}));

jest.mock('micromark-extension-directive', () => ({
  __esModule: true,
  fromMarkdown: jest.fn(() => ({})),
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
jest.mock('monaco-editor', () => ({
  __esModule: true,
  editor: {
    create: jest.fn(),
  },
}));

/**
 * MDX stuff
 */

jest.mock('@mdxeditor/editor', () => ({
  __esModule: true,
  Cell: jest.fn((value) => ({
    get: () => value,
    set: jest.fn(),
    subscribe: jest.fn(),
  })),
  Action: jest.fn((value) => ({})),
  Signal: jest.fn((value) => ({})),
  realmPlugin: jest.fn((value) => ({
    get: () => value,
    set: jest.fn(),
    subscribe: jest.fn(),
  })),
  default: '@mdxeditor/editor',
  namedExport: jest.fn(),
}));

jest.mock('@mdxeditor/gurx', () => ({
  __esModule: true,
  Cell: jest.fn((value) => ({
    get: () => value,
    set: jest.fn(),
    subscribe: jest.fn(),
  })),
  Action: jest.fn((value) => ({})),
  Signal: jest.fn((value) => ({})),
  default: '@mdxeditor/gurx',
  namedExport: jest.fn(),
}));

jest.mock('../../../../../packages/ui/src/lib/cmi5/mdx/state/vars', () => ({
  editorInPlayback$: false,
  setProgress$: () => jest.fn(),
  submitScore$: () => jest.fn(),
}));

const mockKeycloak = jest.fn(() => ({
  init: jest.fn().mockResolvedValue(true), // Mock the init() method to resolve with true
  login: jest.fn(),
  logout: jest.fn(),
  authenticated: true,
  token: 'mock-token',
  hasRealmRole: jest.fn().mockReturnValue(true),
  // Add any other methods your code uses
}));

jest.mock('keycloak-js', () => ({
  __esModule: true,
  default: mockKeycloak,
}));

const mockUseKeycloak = jest.fn(() => ({
  initialized: true,
  keycloak: {
    authenticated: true,
    token: 'mock-token',
    hasRealmRole: jest.fn(() => true),
    profile: { username: 'testuser' },
    // Add other necessary properties
  },
}));

jest.mock('@react-keycloak/web', () => ({
  ...jest.requireActual('@react-keycloak/web'),
  useKeycloak: () => mockUseKeycloak(),
}));
