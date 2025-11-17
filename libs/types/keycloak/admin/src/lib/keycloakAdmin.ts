export type AdminTokenDecoded = {
  access_token: string;
};

export type Client = {
  id: string;
  rootUrl: string;
  adminUrl: string;
  redirectUris: Array<string>;
  webOrigins: Array<string>;
  publicClient: boolean;
  standardFlowEnabled: boolean;
  implicitFlowEnabled: boolean;
};

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
};
