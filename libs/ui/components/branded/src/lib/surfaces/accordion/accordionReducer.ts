import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetPersistance } from '@rangeos-nx/ui/branded';

type tAccordionState = {
  touched: Record<string, boolean>;
};

interface State {
  accordion: tAccordionState;
}

const initialState: tAccordionState = {
  touched: {},
};

export const accordionSlice = createSlice({
  name: 'accordion',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    }),
  reducers: {
    setTouched: (state, action: PayloadAction<tAccordionState['touched']>) => {
      state.touched = action.payload;
    },
  },
});

// export actions to dispatch from components
export const { setTouched } = accordionSlice.actions;

//Selectors
export const touched = (state: State) => state.accordion.touched;

export const accordionReducer = accordionSlice.reducer;
