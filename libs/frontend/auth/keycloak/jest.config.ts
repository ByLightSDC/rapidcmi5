/* eslint-disable */
export default {
  displayName: 'frontend-auth-keycloak',
  preset: '../../../../jest.preset.js',
  setupFiles: ['./jest.setEnvVars.js', './src/setupTests.js'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/frontend/auth/keycloak'
};
