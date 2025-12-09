export type AuthenticationData = {
  authenticated: boolean;
  authenticationType: 'cookie' | 'token' | 'websocket';
  userTokenDecoded: UserTokenDecoded;
};

export type UserTokenDecoded = {
  active: boolean;
  sub: string;
  email: string;
  roles?: Array<ContentManagementRoles | TomRoles>;
};

export type Code = {
  access_token: JWT;
};

export type JWT = string;

export type AllRoles =
  | EventPlaneDatastoreRoles
  | ContentManagementRoles
  | TomRoles;
export type EventPlaneDatastoreRoles = 'kibana_user';
export type ContentManagementRoles = 'initialized-content-management';
export type TomRoles = 'read-metrics';
