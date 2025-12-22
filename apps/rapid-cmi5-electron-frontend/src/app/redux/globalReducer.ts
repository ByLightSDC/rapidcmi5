import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { resetPersistance } from '@rapid-cmi5/ui';
import { RootState } from './store';

type tGlobalState = {
  lastAuthenticationSeconds: number;
};

//Defaults
export const initialState: tGlobalState = {
  lastAuthenticationSeconds: new Date().getTime() / 1000, // current time seconds
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      storage.removeItem('persist:root');
      return { ...initialState };
    }),
  reducers: {
    setlastAuthenticationSeconds: (state, action: PayloadAction<number>) => {
      state.lastAuthenticationSeconds = action.payload;
    },
  },
});

// export actions to dispatch from components
export const { setlastAuthenticationSeconds } = globalSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const lastAuthenticationSeconds = (state: RootState) =>
  state.global.lastAuthenticationSeconds;

export default globalSlice.reducer;
