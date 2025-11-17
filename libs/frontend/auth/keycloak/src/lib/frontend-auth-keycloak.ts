import Keycloak from 'keycloak-js';

import { config } from '@rangeos-nx/frontend/environment';

export const keycloak = new Keycloak({
  clientId: config.KEYCLOAK_CLIENT_ID,
  realm: config.KEYCLOAK_REALM,
  url: `${config.KEYCLOAK_URL}/auth`,
});
