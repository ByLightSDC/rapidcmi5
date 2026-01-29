import KeycloakUi from './ui-keycloak';
import { config } from '@rapid-cmi5/ui';

/* eslint-disable-next-line */
export interface AuthProps {
  children?: JSX.Element;
}

export function AuthUi(props: AuthProps) {
  return (
    <KeycloakUi
      url={config.KEYCLOAK_URL}
      realm={config.KEYCLOAK_REALM}
      clientId={config.KEYCLOAK_CLIENT_ID}
      scope={config.KEYCLOAK_SCOPE}
    >
      {props.children}
    </KeycloakUi>
  );
}
export default AuthUi;
