import { KeycloakUi } from '@rapid-cmi5/keycloak';
import { config } from '@rapid-cmi5/ui';

export interface AuthProps {
  children?: JSX.Element;
}

export default function Auth(props: AuthProps) {
  return (
    config.KEYCLOAK_URL && (
      <KeycloakUi
        url={config.KEYCLOAK_URL}
        realm={config.KEYCLOAK_REALM}
        clientId={config.KEYCLOAK_CLIENT_ID}
        scope={config.KEYCLOAK_SCOPE}
      >
        {props.children}
      </KeycloakUi>
    )
  );
}
