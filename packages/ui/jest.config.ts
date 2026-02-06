/* eslint-disable */
export default {
  displayName: 'ui-components-branded',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!ol)*',
    'node_modules/(?!cidr-tools)*',
    'node_modules/(?!@mdxeditor)*',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/ui/',
  setupFiles: ['./src/setupTests.js'],
};
