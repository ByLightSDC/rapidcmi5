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
