import { resetPersistance } from '@rapid-cmi5/ui/redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  bookmarks: tBookmarkState;
}

export type tBookmarkMetaData = {
  metaProperty: string;
  metaValue: any;
};

export type tBookmark = {
  key: string;
  route: string;
  altModal?: any; //really a modal type
  meta?: any;
  label: string;
  isModal: boolean;
};

export type tBookmarkNotification = {
  callback: (nextBookmark: any) => void;
};

export type tBookmarkState = {
  cue: tBookmark[];
  formData: { [key: string]: any };
  globalData: { [key: string]: any };
  hasModal: boolean;
};

export type tBookmarkFormData = {
  key: string;
  value: any;
};

const initialState: tBookmarkState = {
  cue: [],
  formData: {},
  globalData: {},
  hasModal: false,
};

export const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    }),
  reducers: {
    clearBookmarks: (state, action: PayloadAction) => {
      state.cue = [];
    },
    clearBookmarkMeta: (state, action: PayloadAction) => {
      if (state.cue?.length > 0) {
        state.cue[state.cue?.length - 1].meta = null;
      }
    },
    clearBookmarkMetaData: (state, action: PayloadAction<string>) => {
      if (state.cue?.length > 0) {
        if (
          state.cue[state.cue?.length - 1].meta &&
          state.cue[state.cue?.length - 1].meta.hasOwnProperty(action.payload)
        ) {
          delete state.cue[state.cue?.length - 1]['meta'][action.payload];
        }
      }
    },
    clearAllFormData: (state, action: PayloadAction) => {
      state.formData = {};
    },
    clearFormData: (state, action: PayloadAction<string>) => {
      if (state.formData && state.formData.hasOwnProperty(action.payload)) {
        delete state.formData[action.payload];
      }
    },
    popToBookmark: (state, action: PayloadAction<number>) => {
      if (state.cue?.length > 0) {
        let newArr: tBookmark[] = [];
        for (let i = 0; i < state.cue?.length; i++) {
          if (i <= action.payload) {
            newArr.push(state.cue[i]);
            if (i === action.payload) {
              newArr[i].meta = null; //clear modal meta
            }
          }
        }
        state.cue = newArr;
      }
    },
    popBookmark: (state, action: PayloadAction) => {
      if (state.cue?.length > 0) {
        state.cue.pop();
      }
    },
    pushBookmark: (state, action: PayloadAction<tBookmark>) => {
      if (state.cue?.length > 0) {
        if (state.cue[state.cue?.length - 1].key !== action.payload.key) {
          //this prevents us from adding alt modals with same pth as previous bookmark
          state.cue.push(action.payload);
        }
      } else {
        state.cue.push(action.payload);
      }
    },
    appendBookmarkMetaData: (
      state,
      action: PayloadAction<tBookmarkMetaData>,
    ) => {
      if (state.cue?.length > 0) {
        let metaObj = null;
        if (state.cue[state.cue?.length - 1].hasOwnProperty('meta')) {
          metaObj = state.cue[state.cue?.length - 1].meta;
        }
        if (!metaObj) {
          metaObj = {};
        }
        metaObj[action.payload.metaProperty] = action.payload.metaValue;
        state.cue[state.cue?.length - 1].meta = metaObj;
      } else {
        //save to global space
        state.globalData[action.payload.metaProperty] =
          action.payload.metaValue;
      }
    },
    saveFormData: (state, action: PayloadAction<tBookmarkFormData>) => {
      state.formData[action.payload.key] = action.payload.value;
    },
    setHasModal: (state, action: PayloadAction<tBookmarkState['hasModal']>) => {
      state.hasModal = action.payload;
    },
  },
});

// export actions to dispatch from components
export const {
  appendBookmarkMetaData,
  clearAllFormData,
  clearBookmarks,
  clearBookmarkMeta,
  clearBookmarkMetaData,
  clearFormData,
  popBookmark,
  popToBookmark,
  pushBookmark,
  saveFormData,
  setHasModal,
} = bookmarksSlice.actions;

//Selectors
export const hasModal = (state: State) => state.bookmarks.hasModal;
export const shouldShowBookmarks = (state: State) =>
  state.bookmarks.cue?.length >= 1;
export const bookmarkCue = (state: State) => state.bookmarks.cue;
export const bookmarkFormData = (state: State) => state.bookmarks.formData;
export const bookmarkGlobalData = (state: State) => state.bookmarks.globalData;
export const nextBookmark = (state: State) =>
  state.bookmarks.cue?.length > 0
    ? state.bookmarks.cue[state.bookmarks.cue?.length - 1]
    : null;

export const bookmarksReducer = bookmarksSlice.reducer;
