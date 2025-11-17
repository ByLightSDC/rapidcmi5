import { keycloak } from './frontend-auth-keycloak';

describe('frontendAuthKeycloak', () => {
  it('should work', () => {
    expect(keycloak).toBeTruthy();
  });
});
