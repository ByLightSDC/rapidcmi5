import { TextEncoder, TextDecoder } from 'util';
// This is needed for isomphic git unit tests to work, it will break tests in cc-infra portal if deleted
import 'fake-indexeddb/auto';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.setTimeout(10000);

/** Jest does not handle the scrolling functions since it doesn't do full layout */
Element.prototype.scrollIntoView = jest.fn();

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

/** jest hates isomorpphic git */

/** Jest does not like using router navigate in a custom hook */
jest.mock(
  '../../../libs/ui/components/branded/src/lib/hooks/useNavigateAlias',
  () => ({
    useNavigateAlias: () => jest.fn(),
  }),
);

jest.mock('./app/utils/featureFlags', () => ({
  __esModule: false,
  featureFlagBookmarks: false,
}));

jest.mock(
  '../../../libs/ui/components/branded/src/lib/forms/uuidInspectorFeatureFlags',
  () => ({
    __esModule: false,
    featureFlagInspectField: false,
  }),
);

/** Local Date Display Snapshots Break  */
const mockDateFormatter = () => {
  const formatDisplayDateTime = (databaseDate, dateFormat) => {
    return '11/28/2022 02:39 PM';
  };
  return { formatDisplayDateTime };
};

/** Mock  Hooks */
const mockIsVisible = () => {
  return true;
};
jest.mock(
  `../../../libs/ui/components/branded/src/lib/hooks/useVisibility`,
  () => ({
    useIsVisible: mockIsVisible,
  }),
);
jest.mock(
  `../../../libs/ui/components/branded/src/lib/hooks/useDisplayDateFormatter`,
  () => ({
    useDisplayDateFormatter: mockDateFormatter,
  }),
);

/** Mock Intersection Observer */
class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

/*
Jest can't handle ES6 modules without turning on experimental feature
Mocking the module is easier if you don't need to test it with jest
*/

jest.mock('d3-transition', () => ({
  __esModule: true,
  default: 'd3-selection',
  namedExport: jest.fn(),
  containsCidr: () => true,
}));

jest.mock('d3-transition', () => ({
  __esModule: true,
  default: 'd3-transition',
  namedExport: jest.fn(),
  containsCidr: () => true,
}));

jest.mock('d3-geo', () => ({
  __esModule: true,
  default: 'd3-geo',
  namedExport: jest.fn(),
  containsCidr: () => true,
}));

jest.mock('cidr-tools', () => ({
  __esModule: true,
  default: 'cidr-tools',
  namedExport: jest.fn(),
  containsCidr: () => true,
}));

jest.mock('ip-bigint', () => ({
  __esModule: true,
  default: 'ip-bigint',
  namedExport: jest.fn(),
  stringifyIp: () => '10.10.10.10',
}));

jest.mock('ol/Map', () => ({
  __esModule: true,
  default: 'ol/Map',
  namedExport: jest.fn(),
}));

jest.mock('ol/source/OSM', () => ({
  __esModule: true,
  default: 'ol/source/OSM',
  namedExport: jest.fn(),
}));

jest.mock('ol/View', () => ({
  __esModule: true,
  default: 'ol/View',
  namedExport: jest.fn(),
}));

jest.mock('ol/layer/Tile', () => ({
  __esModule: true,
  default: 'ol/layer/Tile',
  namedExport: jest.fn(),
}));

jest.mock('ol/proj', () => ({
  __esModule: true,
  default: 'ol/proj',
  namedExport: jest.fn(),
}));

jest.mock('ol/Feature', () => ({
  __esModule: true,
  default: 'ol/Feature',
  namedExport: jest.fn(),
}));

jest.mock('ol/geom/Point', () => ({
  __esModule: true,
  default: 'ol/geom/Point',
  namedExport: jest.fn(),
}));

jest.mock('ol/layer/Vector', () => ({
  __esModule: true,
  default: 'ol/layer/Vector',
  namedExport: jest.fn(),
}));

jest.mock('ol/source/Vector', () => ({
  __esModule: true,
  default: 'ol/source/Vector',
  namedExport: jest.fn(),
}));

jest.mock('ol/style/Circle', () => ({
  __esModule: true,
  default: 'ol/style/Circle',
  namedExport: jest.fn(),
}));

jest.mock('ol/style/Fill', () => ({
  __esModule: true,
  default: 'ol/style/Fill',
  namedExport: jest.fn(),
}));

jest.mock('ol/style/Icon', () => ({
  __esModule: true,
  default: 'ol/style/Icon',
  namedExport: jest.fn(),
}));

jest.mock('ol/style/Style', () => ({
  __esModule: true,
  default: 'ol/style/Style',
  namedExport: jest.fn(),
}));

jest.mock('github-slugger', () => ({
  __esModule: true,
  default: class Slugger {},
  namedExport: jest.fn(),
}));

jest.mock('mdast-util-to-markdown', () => ({
  __esModule: true,
  directiveFromMarkdown: jest.fn(() => ({})),
  directiveToMarkdown: jest.fn(() => ({})),
  directive: jest.fn(() => ({})),
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

/**
 * MDX stuff
 */

jest.mock(
  'mdast-util-mdx-jsx',
  () => ({
    __esModule: true,
    mdxJsxFromMarkdown: jest.fn(),
    mdxJsxToMarkdown: jest.fn(),
  }),
  { virtual: true },
);

// jest.setup.ts
Object.defineProperty(global.navigator, 'storage', {
  value: {
    getDirectory: jest.fn(async () => ({
      name: 'mock-directory',
      kind: 'directory',
      // optionally emulate FileSystemDirectoryHandle methods
      getFileHandle: jest.fn(async (name) => ({
        name,
        kind: 'file',
        getFile: jest.fn(async () => new Blob(['mock file'])),
      })),
      getDirectoryHandle: jest.fn(async (name) => ({
        name,
        kind: 'directory',
      })),
    })),
  },
});

// zen fs does not work in the browser, we will instead use lightning fs instead
jest.mock('@zenfs/core', () => {
  return {
    __esModule: true,
    configure: jest.fn().mockResolvedValue(undefined),
  };
});
jest.mock('@zenfs/dom', () => ({
  __esModule: true,
  IndexedDB: {
    create: jest.fn(),
  },
  WebAcces: {
    create: jest.fn(),
  },
}));

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

jest.mock(
  '../../../libs/ui/components/branded/src/lib/cmi5/mdx/state/vars',
  () => ({
    editorInPlayback$: false,
    setProgress$: () => jest.fn(),
    submitScore$: () => jest.fn(),
  }),
);

jest.mock('micromark-extension-math', () => ({
  __esModule: true,
  math: jest.fn(),
  mathHtml: jest.fn(),
}));

jest.mock('mdast-util-math', () => ({
  __esModule: true,
  mathFromMarkdown: jest.fn(),
  mathToMarkdown: jest.fn(),
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
