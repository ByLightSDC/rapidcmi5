import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetPersistance } from '@rangeos-nx/ui/branded';

/**
 * @interface SliceState
 * Represents slice within the context of the redux store that implements it
 * @property {tPaginationState} pagination
 */
interface SliceState {
  pagination: tPaginationState;
}

/**
 * @interface Filters
 * @example  {"Certificates": {"tag": "Any", "sortBy": "dateEdited", "order": "desc"}, "DNS Servers": { "sortBy": "dateEdited", "order": "desc"}}
 */
interface Filters {
  [key: string]: { [key: string]: string };
}

/**
 * @interface PageSettings
 * @example  {"Certificates": {"page": 1, "rowsPerPage": 10}}}
 */
interface PageSettings {
  [key: string]: { [key: string]: any };
}

/**
 * @typedef {Object} tPaginationState
 * @property {Settings} settings={} Pagination Settings
 * @property {Filters} filters={} Filters passed to paging endpoints
 */
type tPaginationState = {
  pageSettings: PageSettings;
  pageFilters: Filters;
};

/**
 * @typedef {Object} tFilterPropVal
 * @property {string} property API Topic
 * @property {any} value Object to persist
 */
type tFilterPropVal = {
  property: string;
  value: { [key: string]: any };
};

/**
 * @typedef {Object} tSettingPropVal
 * @property {string} topic API Topic
 * @property {string} property Setting property
 * @property {any} value Object to persist
 */
type tSettingPropVal = {
  topic: string;
  property: string;
  value: any;
};

/** @constant
 * Initial Redux State
 * @type {tPaginationState}
 * @default
 */
const initialState: tPaginationState = {
  pageFilters: {},
  pageSettings: {},
};

export const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    }),
  reducers: {
    setPageFilters: (state, action: PayloadAction<tFilterPropVal>) => {
      state.pageFilters[action.payload.property] = action.payload.value;
    },
    setPageSettings: (state, action: PayloadAction<tSettingPropVal>) => {
      if (state.pageSettings.hasOwnProperty(action.payload.property)) {
        state.pageSettings[action.payload.topic][action.payload.property] =
          action.payload.value;
      } else {
        state.pageSettings[action.payload.topic] = {
          [action.payload.property]: action.payload.value,
        };
      }
    },
  },
});

// export actions to dispatch from components
export const { setPageFilters, setPageSettings } = paginationSlice.actions;

//Selectors
export const pageFilters = (state: SliceState) => state.pagination.pageFilters;
export const pageSettings = (state: SliceState) =>
  state.pagination.pageSettings;

export const paginationReducer = paginationSlice.reducer;
