export default {
  displayName: 'rapid-cmi5-electron',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
    testPathIgnorePatterns: [
    "<rootDir>/e2e/",   
  ],
  coverageDirectory: '../../coverage/apps/rapid-cmi5-electron',
};
