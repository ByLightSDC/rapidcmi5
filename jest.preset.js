const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  workerIdleMemoryLimit: '1GB',
  maxWorkers: '2',
  reporters: [
    'default',
    [
      '@jest-performance-reporter/core',
      {
        errorAfterMs: 1000,
        warnAfterMs: 500,
        logLevel: 'warn',
        maxItems: 10,
        // jsonReportPath: 'performance-report.json',
        // csvReportPath: 'performance-report.csv',
      },
    ],
  ],
  transformIgnorePatterns: [
    'node_modules/(?!remark-gfm|remark-parse|unified|unist-util-visit|react-directive|mdast-util-from-markdown|mdast-util-gfm-footnote)',
    'node_modules/(?!micromark-extension-gfm-footnote).+\\.js$',
    'node_modules/(?!remark-gfm)/index.js',
    'node_modules/(?!react-directive)/index.js',
    'node_modules/(?!@mdx-js/react)/mdx/index.js',
    'node_modules/(?!@mdxeditor)*',
    'node_modules/(?!mui-color-input)*',
    'node_modules/(?!keycloak-js)*',
  ],
  moduleNameMapper: {
    'mui-color-input': 'test/mock/ReactMarkdownMock.tsx',
    '@mdx-editor*': 'test/mock/ReactMarkdownMock.tsx',
    '@mdxeditor/gurx': 'test/mock/ReactMarkdownMock.tsx',
    '@mdx-js*': 'test/mock/ReactMarkdownMock.tsx',
    gfmFootnote: 'test/mock/ReactMarkdownMock.tsx',
    'unist-util-visit': 'test/mock/ReactMarkdownMock.tsx',
    'mdast-util-from-markdown': 'test/mock/ReactMarkdownMock.tsx',
    'mdast-util-to-string': 'test/mock/ReactMarkdownMock.tsx',
    'mdast-util-gfm-footnote': 'test/mock/ReactMarkdownMock.tsx',
    'micromark-extension-gfm-footnote': 'test/mock/ReactMarkdownMock.tsx',
    'rehype-katex': 'test/mock/ReactMarkdownMock.tsx',
    'remark-*': 'test/mock/ReactMarkdownMock.tsx',
    'react-directive': 'test/mock/ReactMarkdownMock.tsx',
    'react-markdown': 'test/mock/ReactMarkdownMock.tsx',
    'rehype-raw': 'test/mock/ReactMarkdownMock.tsx',
    'keycloak-js': 'node_modules/keycloak-js/lib/keycloak.js',
  },
};
