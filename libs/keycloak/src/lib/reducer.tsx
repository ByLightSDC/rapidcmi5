import { GitCredentials } from '@rapid-cmi5/cmi5-build-common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type tKeycloakUiState = {
  auth: {
    username?: string;
    role?: string;
    roles?: string[];
    parsedUserToken?: any;
  };
  authError: { id?: string | null; error?: string | null };
  authIdToken: string | undefined;
  authRefreshError: { error?: string | null };
  authToken: string | undefined;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  isSSOEnabled: boolean;
  devOpsApi: string | undefined;
  gitCredentials: GitCredentials | undefined;
};

interface State {
  keycloakUi: tKeycloakUiState;
}

export const initialState: tKeycloakUiState = {
  auth: { username: '', role: 'Infrastructure', parsedUserToken: null },
  authError: { id: null, error: null },
  authRefreshError: { error: null },
  authIdToken: '',
  authToken: '',
  isAuthenticated: false,
  isLoggingOut: false,
  isSSOEnabled: true,
  devOpsApi: undefined,
  gitCredentials: undefined
};

export const keycloakUiSlice = createSlice({
  name: 'keycloakUi',
  initialState,
  reducers: {
    setAuthError: (
      state,
      action: PayloadAction<tKeycloakUiState['authError']>,
    ) => {
      state.authError = action.payload;
    },
    setAuth: (state, action: PayloadAction<tKeycloakUiState['auth']>) => {
      state.auth = action.payload;
    },
    setAuthRefreshError: (
      state,
      action: PayloadAction<tKeycloakUiState['authRefreshError']>,
    ) => {
      state.authRefreshError = action.payload;
    },
    setAuthToken: (
      state,
      action: PayloadAction<tKeycloakUiState['authToken']>,
    ) => {
      state.authToken = action.payload;
    },
    setAuthIdToken: (
      state,
      action: PayloadAction<tKeycloakUiState['authIdToken']>,
    ) => {
      state.authIdToken = action.payload;
    },
    setIsAuthenticated: (
      state,
      action: PayloadAction<tKeycloakUiState['isAuthenticated']>,
    ) => {
      state.isAuthenticated = action.payload;
    },
    setIsLoggingOut: (
      state,
      action: PayloadAction<tKeycloakUiState['isLoggingOut']>,
    ) => {
      state.isLoggingOut = action.payload;
    },
    setIsSSOEnabled: (
      state,
      action: PayloadAction<tKeycloakUiState['isSSOEnabled']>,
    ) => {
      state.isSSOEnabled = action.payload;
    },
    setDevopsApi: (state, action: PayloadAction<string>) => {
      state.devOpsApi = action.payload;
    },
    setGitCredentials: (state, action: PayloadAction<GitCredentials>) => {
      state.gitCredentials = action.payload;
    },
  },
});

// export actions to dispatch from components
export const {
  setAuth,
  setAuthIdToken,
  setAuthError,
  setAuthRefreshError,
  setAuthToken,
  setIsAuthenticated,
  setIsLoggingOut,
  setIsSSOEnabled,
  setDevopsApi,
  setGitCredentials
} = keycloakUiSlice.actions;

//Selectors
export const authError = (state: State) => state.keycloakUi.authError;

export const authRefreshError = (state: State) =>
  state.keycloakUi.authRefreshError;

export const authIdToken = (state: State) => state.keycloakUi.authIdToken;
export const authToken = (state: State) => state.keycloakUi.authToken;

export const auth = (state: {
  keycloakUi: tKeycloakUiState;
}): tKeycloakUiState['auth'] => state.keycloakUi.auth;

export const isAuthenticated = (state: State) =>
  state.keycloakUi.isAuthenticated;

export const isLoggingOut = (state: State) => state.keycloakUi.isLoggingOut;

export const isSSOEnabled = (state: State) => state.keycloakUi.isSSOEnabled;
export const devopsApiUrl = (state: State) => state.keycloakUi.devOpsApi;
export const gitCredentials = (state: State) => state.keycloakUi.gitCredentials;


export const keycloakUiReducer = keycloakUiSlice.reducer;
