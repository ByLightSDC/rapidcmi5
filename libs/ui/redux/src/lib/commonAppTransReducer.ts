import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { AppMenuConfigItem } from './utils/types';

export type tCommonAppTransState = {
  appHeaderVisible: boolean;
  breadCrumbLeft: number;
  breadCrumbVisible: boolean;
  plugins: AppMenuConfigItem[];
};

interface State {
  commonAppTrans: tCommonAppTransState;
}

//Defaults
export const initialCommonAppTransState: tCommonAppTransState = {
  appHeaderVisible: true,
  breadCrumbLeft: 8,
  breadCrumbVisible: true,
  plugins: [],
};

export const commonAppTransSlice : Slice = createSlice({
  name: 'commonAppTrans',
  initialState: initialCommonAppTransState,

  reducers: {
    setAppHeaderVisible: (state, action: PayloadAction<boolean>) => {
      state.appHeaderVisible = action.payload;
    },
    setBreadCrumbLeft: (state, action: PayloadAction<number>) => {
      state.breadCrumbLeft = action.payload;
    },
    setBreadCrumbVisible: (state, action: PayloadAction<boolean>) => {
      state.breadCrumbVisible = action.payload;
    },
    setPlugins: (state, action: PayloadAction<AppMenuConfigItem[]>) => {
      state.plugins = action.payload;
    },
  },
});

// export actions to dispatch from components
export const {
  setAppHeaderVisible,
  setBreadCrumbLeft,
  setBreadCrumbVisible,
  setPlugins,
} = commonAppTransSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const appHeaderVisible = (state: State) =>
  state.commonAppTrans.appHeaderVisible;
export const breadCrumbLeft = (state: State) =>
  state.commonAppTrans.breadCrumbLeft;
export const breadCrumbVisible = (state: State) =>
  state.commonAppTrans.breadCrumbVisible;
export const plugins = (state: State) => state.commonAppTrans.plugins;

export const commonAppTransReducer = commonAppTransSlice.reducer;
