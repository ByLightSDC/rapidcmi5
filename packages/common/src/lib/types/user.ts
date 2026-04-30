export interface SSOConfig {
  ssoEnabled: boolean;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakScope: string;
  rangeRestApiUrl: string;
  quizBankApiUrl: string;
  redirectUrl: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface GitUserConfig {
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

export interface CertInfo {
  id: string;
  filename: string;
  addedAt: string;
  subject?: string;
}
