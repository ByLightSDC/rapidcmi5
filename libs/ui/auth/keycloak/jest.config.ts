/* eslint-disable */
export default {
  displayName: 'ui-auth-keycloak',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
    '^.+\\.svg$': '<rootDir>/jest-svg-transformer.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!ol)*',
    'node_modules/(?!cidr-tools)*',
    'node_modules/(?!@mdxeditor)*',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/ui/auth/keycloak',
  setupFiles: ['./src/setupTests.js'],
};
