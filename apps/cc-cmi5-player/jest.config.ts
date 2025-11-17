/* eslint-disable */
export default {
  displayName: 'cc-cmi5-player',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.(js|jsx|ts|tsx)?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!@mdxeditor)*'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '@xapi/cmi5': 'node_modules/@xapi/cmi5/dist/Cmi5.umd.js',
  },
  coverageDirectory: '../../coverage/apps/cc-cmi5-player',
  setupFiles: ['./src/setupTests.js'],
};
