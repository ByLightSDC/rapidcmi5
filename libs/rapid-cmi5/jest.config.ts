/* eslint-disable */
export default {
  displayName: 'rapid-cmi5',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!ol)*',
    'node_modules/(?!cidr-tools)*',
    'node_modules/(?!@mdxeditor)*',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/rapid-cmi5',
  setupFiles: ['./src/setupTests.js'],
};
