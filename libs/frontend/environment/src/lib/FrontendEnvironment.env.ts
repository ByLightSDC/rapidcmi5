import yn from 'yn';

declare global {
  interface Window {
    _env_?: {
      NX_PUBLIC_AUTH_URL?: string;
      NX_PUBLIC_CLIENT_LOG?: boolean;

      NX_PUBLIC_DEVOPS_API_URL?: string;
      NX_PUBLIC_DEVOPS_GQL_URL?: string;

      NX_PUBLIC_KEYCLOAK_URL?: string;
      NX_PUBLIC_KEYCLOAK_REALM?: string;
      NX_PUBLIC_KEYCLOAK_CLIENT_ID?: string;
      NX_PUBLIC_KEYCLOAK_SCOPE?: string;
      NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL?: string;
    };
  }
}

// overloaded function which will throw error at runtime if environment variable is not defined
function checkEnv(
  type: string | undefined,
  description: string,
): string | never;
function checkEnv(
  type: boolean | undefined,
  description: string,
): boolean | never;
function checkEnv(env: string | boolean | undefined, description: string) {
  if (env === undefined) {
    console.log(`You must specify ${description}`);
    //TEMP process.exit(1);
  }
  return env;
}

let AUTH_URL =
  window._env_?.NX_PUBLIC_AUTH_URL || process.env['NX_PUBLIC_AUTH_URL'];
AUTH_URL = checkEnv(AUTH_URL, 'NX_PUBLIC_AUTH_URL');

// db api settings
let DEVOPS_API_URL =
  window._env_?.NX_PUBLIC_DEVOPS_API_URL ||
  process.env['NX_PUBLIC_DEVOPS_API_URL'];
DEVOPS_API_URL = checkEnv(DEVOPS_API_URL, 'NX_PUBLIC_DEVOPS_API_URL');
let CLIENT_LOG =
  window._env_?.NX_PUBLIC_CLIENT_LOG ||
  yn(process.env['NX_PUBLIC_CLIENT_LOG'], { default: false });
CLIENT_LOG = checkEnv(CLIENT_LOG, 'NX_PUBLIC_CLIENT_LOG');

// keycloak settings
// fallback on values used when running cypress tests
let KEYCLOAK_URL =
  window._env_?.NX_PUBLIC_KEYCLOAK_URL || process.env['NX_PUBLIC_KEYCLOAK_URL'];
KEYCLOAK_URL = checkEnv(KEYCLOAK_URL, 'NX_PUBLIC_KEYCLOAK_URL');

let KEYCLOAK_REALM =
  window._env_?.NX_PUBLIC_KEYCLOAK_REALM ||
  process.env['NX_PUBLIC_KEYCLOAK_REALM'];
KEYCLOAK_REALM = checkEnv(KEYCLOAK_REALM, 'NX_PUBLIC_KEYCLOAK_REALM');

let KEYCLOAK_CLIENT_ID =
  window._env_?.NX_PUBLIC_KEYCLOAK_CLIENT_ID ||
  process.env['NX_PUBLIC_KEYCLOAK_CLIENT_ID'];
KEYCLOAK_CLIENT_ID = checkEnv(
  KEYCLOAK_CLIENT_ID,
  'NX_PUBLIC_KEYCLOAK_CLIENT_ID',
);

let KEYCLOAK_SCOPE =
  window._env_?.NX_PUBLIC_KEYCLOAK_SCOPE ||
  process.env['NX_PUBLIC_KEYCLOAK_SCOPE'];
KEYCLOAK_SCOPE = checkEnv(KEYCLOAK_SCOPE, 'NX_PUBLIC_KEYCLOAK_SCOPE');

let DEVOPS_GQL_SUBSCRIPTIONS_URL =
  window._env_?.NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL ||
  process.env['NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL'];
DEVOPS_GQL_SUBSCRIPTIONS_URL = checkEnv(
  DEVOPS_GQL_SUBSCRIPTIONS_URL,
  'NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL',
);

let DEVOPS_GQL_URL =
  window._env_?.NX_PUBLIC_DEVOPS_GQL_URL ||
  process.env['NX_PUBLIC_DEVOPS_GQL_URL'];
DEVOPS_GQL_URL = checkEnv(DEVOPS_GQL_URL, 'NX_PUBLIC_DEVOPS_GQL_URL');

//Static
const DEVOPS_API_CMI_VERSION = '/v1/cmi5';
const DEVOPS_API_CONTENT_VERSION = '/v1/content';
const DEVOPS_API_DESIGN_VERSION = '/v1/design';

export const config = {
  AUTH_URL,
  CLIENT_LOG,
  DEVOPS_API_CMI_VERSION,
  DEVOPS_API_CONTENT_VERSION,
  DEVOPS_API_DESIGN_VERSION,
  DEVOPS_API_URL,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_SCOPE,
  DEVOPS_GQL_SUBSCRIPTIONS_URL,
  DEVOPS_GQL_URL,
  THEME: {
    SLIDE_BACKGROUND: '',
    SLIDE_LOGO: './assets/rapid-cmi5/RapidCMI5.png',
  },
};
