import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snackStatus: { open: false, severity: 'success' as Severity, message: '' },
};

export type Severity = 'success' | 'info' | 'warning' | 'error';
type SnackStatus = {
  open: boolean;
  severity: Severity;
  message: string;
};

const snackSlice = createSlice({
  name: 'snack',
  initialState,
  reducers: {
    setSnackStatus: (
      state,
      action: {
        payload: SnackStatus;
        type: string;
      },
    ) => {
      state.snackStatus = action.payload;
    },
  },
});

export const selectSnackStatus = (state: {
  snack: typeof initialState;
}): SnackStatus => state.snack.snackStatus;

export const { setSnackStatus } = snackSlice.actions;

export const snackReducer = snackSlice.reducer;
