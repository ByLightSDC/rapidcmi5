import yn from 'yn';

declare global {
  interface Window {
    _env_?: {
      NX_PUBLIC_AUTH_URL?: string;
      NX_PUBLIC_CLIENT_LOG?: boolean;
      NX_PUBLIC_CMI5_PLAYER_VERSION?: string;
      NX_PUBLIC_CMI5_SSO_ENABLED?: boolean;
      NX_PUBLIC_CYPRESS?: boolean;
      NX_PUBLIC_LTI_ENABLED?: boolean;
      NX_PUBLIC_LTI_API_URL?: string;
      NX_PUBLIC_MSW_MOCK?: boolean;
      NX_PUBLIC_DEVOPS_API_URL?: string;
      NX_PUBLIC_LMS_API_URL?: string;
      NX_PUBLIC_DEVOPS_GQL_URL?: string;
      NX_PUBLIC_KASM_API_URL?: string;
      NX_PUBLIC_KASM_PROTOCOL?: string;
      NX_PUBLIC_KASM_HOSTNAME?: string;
      NX_PUBLIC_KASM_PORT?: string;
      NX_PUBLIC_KEYCLOAK_URL?: string;
      NX_PUBLIC_KEYCLOAK_REALM?: string;
      NX_PUBLIC_KEYCLOAK_CLIENT_ID?: string;
      NX_PUBLIC_KEYCLOAK_SCOPE?: string;
      NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL?: string;
      NX_PUBLIC_DOCS_URL?: string;

      //OLD
      CALCULATE_API_URL?: boolean;
      DEPLOYMENT_KEY?: string;
      EVENT_KEY?: string;
      KEYCLOAK_URL?: string;
      KEYCLOAK_REALM?: string;
      KEYCLOAK_CLIENT?: string;
      OPENDASH_URL?: string;
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

let CLIENT_LOG =
  window._env_?.NX_PUBLIC_CLIENT_LOG ||
  yn(process.env['NX_PUBLIC_CLIENT_LOG'], { default: false });
CLIENT_LOG = checkEnv(CLIENT_LOG, 'NX_PUBLIC_CLIENT_LOG');

// set to true in .env file to run locally and test "serve" of app with mock data
let CYPRESS =
  window._env_?.NX_PUBLIC_CYPRESS ||
  yn(process.env['NX_PUBLIC_CYPRESS'], { default: false });
CYPRESS = checkEnv(CYPRESS, 'NX_PUBLIC_CYPRESS');

let LTI_ENABLED =
  window._env_?.NX_PUBLIC_LTI_ENABLED ||
  yn(process.env['NX_PUBLIC_LTI_ENABLED'], { default: false });
LTI_ENABLED = checkEnv(LTI_ENABLED, 'NX_PUBLIC_LTI_ENABLED');

let LTI_API_URL =
  window._env_?.NX_PUBLIC_LTI_API_URL || process.env['NX_PUBLIC_LTI_API_URL'];
LTI_API_URL = checkEnv(LTI_API_URL, 'NX_PUBLIC_LTI_API_URL');

let MSW_MOCK =
  window._env_?.NX_PUBLIC_MSW_MOCK ||
  yn(process.env['NX_PUBLIC_MSW_MOCK'], { default: false });
MSW_MOCK = checkEnv(MSW_MOCK, 'NX_PUBLIC_MSW_MOCK');

// db api settings
let DEVOPS_API_URL =
  window._env_?.NX_PUBLIC_DEVOPS_API_URL ||
  process.env['NX_PUBLIC_DEVOPS_API_URL'];
DEVOPS_API_URL = checkEnv(DEVOPS_API_URL, 'NX_PUBLIC_DEVOPS_API_URL');

// db api settings
let LMS_API_URL =
  window._env_?.NX_PUBLIC_LMS_API_URL || process.env['NX_PUBLIC_LMS_API_URL'];
LMS_API_URL = checkEnv(LMS_API_URL, 'NX_PUBLIC_LMS_API_URL');

let KASM_API_URL =
  window._env_?.NX_PUBLIC_KASM_API_URL || process.env['NX_PUBLIC_KASM_API_URL'];
KASM_API_URL = checkEnv(KASM_API_URL, 'NX_PUBLIC_KASM_API_URL');

let KASM_PROTOCOL =
  window._env_?.NX_PUBLIC_KASM_PROTOCOL ||
  process.env['NX_PUBLIC_KASM_PROTOCOL'];
KASM_PROTOCOL = checkEnv(KASM_PROTOCOL, 'NX_PUBLIC_KASM_PROTOCOL');

let KASM_HOSTNAME =
  window._env_?.NX_PUBLIC_KASM_HOSTNAME ||
  process.env['NX_PUBLIC_KASM_HOSTNAME'];
KASM_HOSTNAME = checkEnv(KASM_HOSTNAME, 'NX_PUBLIC_KASM_HOSTNAME');

let KASM_PORT =
  window._env_?.NX_PUBLIC_KASM_PORT || process.env['NX_PUBLIC_KASM_PORT'];
KASM_PORT = checkEnv(KASM_PORT, 'NX_PUBLIC_KASM_PORT');

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

let DOCS_URL =
  window._env_?.NX_PUBLIC_DOCS_URL || process.env['NX_PUBLIC_DOCS_URL'];
DOCS_URL = checkEnv(DOCS_URL, 'NX_PUBLIC_DOCS_URL');

let CMI5_PLAYER_VERSION =
  window._env_?.NX_PUBLIC_CMI5_PLAYER_VERSION ||
  process.env['NX_PUBLIC_CMI5_PLAYER_VERSION'];
CMI5_PLAYER_VERSION = checkEnv(
  CMI5_PLAYER_VERSION,
  'NX_PUBLIC_CMI5_PLAYER_VERSION',
);

let CMI5_SSO_ENABLED =
  window._env_?.NX_PUBLIC_CMI5_SSO_ENABLED ||
  yn(process.env['NX_PUBLIC_CMI5_SSO_ENABLED'], { default: false });
CMI5_SSO_ENABLED = checkEnv(CMI5_SSO_ENABLED, 'NX_PUBLIC_CMI5_SSO_ENABLED');

//Static
const DEVOPS_API_CMI_VERSION = '/v1/cmi5';
const DEVOPS_API_CONTENT_VERSION = '/v1/content';
const DEVOPS_API_DESIGN_VERSION = '/v1/design';

export const config = {
  AUTH_URL,
  CLIENT_LOG,
  CYPRESS,
  DEVOPS_API_CMI_VERSION,
  DEVOPS_API_CONTENT_VERSION,
  DEVOPS_API_DESIGN_VERSION,
  DEVOPS_API_URL,
  LMS_API_URL,
  LTI_ENABLED,
  LTI_API_URL,
  MSW_MOCK,
  KASM_API_URL,
  KASM_PROTOCOL,
  KASM_HOSTNAME,
  KASM_PORT,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_SCOPE,
  DEVOPS_GQL_SUBSCRIPTIONS_URL,
  DEVOPS_GQL_URL,
  DOCS_URL,
  CMI5_PLAYER_VERSION,
  CMI5_SSO_ENABLED,
  THEME: {
    SLIDE_BACKGROUND: '',
    SLIDE_LOGO: './assets/rapid-cmi5/RapidCMI5.png',
  },
};

//Refactor These Dependencies

// Loaded strictly from ENV, not exported out of lib
export const calculateApiUrl = window?._env_?.CALCULATE_API_URL || null;
export const opendashUrl = window?._env_?.OPENDASH_URL || null;

// These can change from events and are for lib internal use only
export const deploymentKey = window?._env_?.DEPLOYMENT_KEY || null;
export const eventKey = window?._env_?.EVENT_KEY || null;
