/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { resetPersistance } from './utils/store';
import { FormCrudType } from './utils/types';

/**
 * Expanded values
 */
export type CommonAppExpandedState = {
  key: string;
  value: boolean;
};

/**
 * Message cue Data
 */
export type CommonAppMessageState = {
  type: string;
  message: string;
  meta?: any;
};

/**
 * Modal Data
 */
export type CommonAppModalState = {
  type: string;
  id: string | null;
  name: string | null;
  meta?: any;
  version?: string;
  crudType?: FormCrudType;
  topic?: string | null;
};

/**
 * Selection data
 */
export type CommonAppSelectionState = {
  key: string;
  id: string;
  meta?: any;
  modalMeta?: any;
};

/**
 * Multiple Selection data
 */
export type CommonAppMultipleSelectionState = {
  key: string;
  //selections type changed from GlobalSelectionState to any
  //in order to support saving selections of strings such as uuids.
  selections: any[];
};

/**
 * Common App Store State
 */
export type tCommonAppState = {
  expanded: { [key: string]: boolean };
  iconColor: string;
  dividerColor: string;
  themeColor: string;
  isLoading: boolean;
  isNavOpen: boolean;
  navBarIndex: number;
  currentFormCrudType: FormCrudType;
  lastAuthenticationSeconds: number;
  message: CommonAppMessageState;
  modal: CommonAppModalState;
  selection: CommonAppSelectionState[];
  multipleSelection: CommonAppMultipleSelectionState[];
};

export interface State {
  commonApp: tCommonAppState;
}

//Defaults
export const initialCommonAppState: tCommonAppState = {
  expanded: {},
  iconColor: 'primary',
  dividerColor: 'grey',
  themeColor: 'light',
  isLoading: false,
  isNavOpen: true,
  navBarIndex: -1,
  currentFormCrudType: FormCrudType.view,
  lastAuthenticationSeconds: new Date().getTime() / 1000, // current time seconds
  message: { type: '', message: '' },
  modal: {
    type: '',
    id: null,
    name: null,
    meta: null,
    crudType: FormCrudType.view,
    topic: null,
  },
  selection: [],
  multipleSelection: [],
};

export const commonAppSlice : Slice = createSlice({
  name: 'commonApp',
  initialState: initialCommonAppState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, (state) => {
      // although we DO want to reset the redux for this slice when the user logs out,
      // we still want persist the themeColor (by looking at the current state)
      return { ...initialCommonAppState, themeColor: state.themeColor };
    }),
  reducers: {
    setDividerColor: (state, action: PayloadAction<string>) => {
      state.dividerColor = action.payload;
    },
    setExpanded: (state, action: PayloadAction<CommonAppExpandedState>) => {
      state.expanded[action.payload.key] = action.payload.value;
    },
    setIconColor: (state, action: PayloadAction<string>) => {
      state.iconColor = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.themeColor = action.payload;
    },
    setLoader: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNavbarToggle: (state) => {
      state.isNavOpen = !state.isNavOpen;
    },
    setNavbarToggleState: (state, action: PayloadAction<boolean>) => {
      state.isNavOpen = action.payload;
    },
    setNavbarIndex: (state, action: PayloadAction<number>) => {
      state.navBarIndex = action.payload;
    },
    setCurrentFormCrudType: (
      state,
      action: PayloadAction<tCommonAppState['currentFormCrudType']>,
    ) => {
      state.currentFormCrudType = action.payload;
    },
    setlastAuthenticationSeconds: (state, action: PayloadAction<number>) => {
      state.lastAuthenticationSeconds = action.payload;
    },
    setMessage: (state, action: PayloadAction<tCommonAppState['message']>) => {
      state.message = action.payload;
    },
    setModal: (state, action: PayloadAction<tCommonAppState['modal']>) => {
      state.modal = action.payload;
    },
    setSelection: (
      state,
      action: PayloadAction<tCommonAppState['selection']>,
    ) => {
      state.selection = action.payload;
    },
    setMultipleSelection: (
      state,
      action: PayloadAction<tCommonAppState['multipleSelection']>,
    ) => {
      state.multipleSelection = action.payload;
    },
  },
});

// export actions to dispatch from components
export const {
  setDividerColor,
  setExpanded,
  setIconColor,
  setTheme,
  setLoader,
  setMessage,
  setNavbarToggle,
  setNavbarToggleState,
  setNavbarIndex,
  setCurrentFormCrudType,
  setlastAuthenticationSeconds,
  setModal,
  setSelection,
  setMultipleSelection,
} = commonAppSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const expanded = (state: State) => state.commonApp.expanded;
export const iconColor = (state: State) => state.commonApp.iconColor;
export const dividerColor = (state: State) => state.commonApp.dividerColor;
export const themeColor = (state: State) => state.commonApp.themeColor;
export const isLoading = (state: State) => state.commonApp.isLoading;
export const isNavOpen = (state: State) => state.commonApp.isNavOpen;
export const navBarIndex = (state: State) => state.commonApp.navBarIndex;
export const currentFormCrudType = (state: State) =>
  state.commonApp.currentFormCrudType;
export const message = (state: State) => state.commonApp.message;
export const modal = (state: State) => state.commonApp.modal;
export const selection = (state: State) => state.commonApp.selection;
export const multipleSelection = (state: State) =>
  state.commonApp.multipleSelection;

export const commonAppReducer = commonAppSlice.reducer;
