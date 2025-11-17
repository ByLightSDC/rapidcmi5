import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  receivedSharedRequest: false,
  apiUrl: null as string | null,
  eventKey: null as string | null,
  wardenEventKey: null as string | null,
  deploymentKey: null as string | null,
};

const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    setReceivedSharedRequest: (
      state,
      action: { payload: boolean; type: string },
    ) => {
      state.receivedSharedRequest = action.payload;
    },
    setApiUrl: (state, action: { payload: string; type: string }) => {
      state.apiUrl = action.payload;
    },
    setDeploymentKey: (state, action: { payload: string; type: string }) => {
      state.deploymentKey = action.payload;
    },
    setEventKey: (state, action: { payload: string; type: string }) => {
      state.eventKey = action.payload;
    },
    setWardenEventKey: (state, action: { payload: string; type: string }) => {
      state.wardenEventKey = action.payload;
    },
  },
});

export const selectReceivedSharedRequest = (state: {
  environment: typeof initialState;
}): boolean => state.environment.receivedSharedRequest;

export const selectApiUrl = (state: {
  environment: typeof initialState;
}): string | null => state.environment.apiUrl;

export const selectEventKey = (state: {
  environment: typeof initialState;
}): string | null => state.environment.eventKey;

export const selectWardenEventKey = (state: {
  environment: typeof initialState;
}): string | null => state.environment.wardenEventKey;

export const selectDeploymentKey = (state: {
  environment: typeof initialState;
}): string | null => state.environment.deploymentKey;

export const {
  setReceivedSharedRequest,
  setApiUrl,
  setEventKey,
  setWardenEventKey,
  setDeploymentKey,
} = environmentSlice.actions;

export const environmentReducer = environmentSlice.reducer;
export type EnvironmentState = ReturnType<typeof environmentReducer>;
