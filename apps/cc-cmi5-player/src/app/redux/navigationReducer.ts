import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

type tNavigationState = {
  activeTab: number;
};

//Defaults
export const initialState: tNavigationState = {
  activeTab: 0,
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setActiveTab } = navigationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const activeTabSel = (state: RootState) => state.navigation.activeTab;

export default navigationSlice.reducer;
