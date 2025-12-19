import { useKeycloak } from '@react-keycloak/web';
import { config } from '@rapid-cmi5/ui/branded';

export const useKeycloakRoleAuth = (roles: Array<string>) => {
  const { keycloak } = useKeycloak();

  if (keycloak && roles) {
    return roles.some((role: string) => {
      // return true if the role is found in either the realm or the resource
      const realm = keycloak.hasRealmRole(role);
      const resource = keycloak.hasResourceRole(
        role,
        config.KEYCLOAK_CLIENT_ID,
      );

      return realm || resource;
    });
  }

  return false;
};
