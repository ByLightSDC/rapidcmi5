export default {
  displayName: 'rapid-cmi5-electron-frontend',
  preset: '../../jest.preset.js',
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
  coverageDirectory: '../../coverage/apps/rapid-cmi5-electron-frontend',
  setupFiles: ['./src/setupTests.js'],
};
