export interface SSOConfig {
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakScope: string;
  devopsApiUrl: string;
  username: string;
  password: string;
}

export interface GitCredentials {
  username: string;
  password: string;
  authorName: string;
  authorEmail: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}
