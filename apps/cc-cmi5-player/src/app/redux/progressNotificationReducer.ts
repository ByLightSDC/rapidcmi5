import type { ToasterProps } from '@rapid-cmi5/ui';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface UnitResultActivity {
  id: string;
  title: string;
  slideLabel: string;
  scoreLabel: string;
}

export interface UnitResult {
  outcome: 'completed' | 'passed';
  auTitle: string;
  gradePercent?: number;
  scoredActivityCount: number;
  activities: UnitResultActivity[];
}

interface QueuedProgressToast {
  id: number;
  toast: ToasterProps;
}

interface ProgressNotificationState {
  toastQueue: QueuedProgressToast[];
  nextToastId: number;
  unitResult: UnitResult | null;
}

export const initialState: ProgressNotificationState = {
  toastQueue: [],
  nextToastId: 1,
  unitResult: null,
};

export const progressNotificationSlice = createSlice({
  name: 'progressNotification',
  initialState,
  reducers: {
    queueProgressToast: (state, action: PayloadAction<ToasterProps>) => {
      state.toastQueue.push({ id: state.nextToastId++, toast: action.payload });
    },
    removeProgressToast: (state, action: PayloadAction<number>) => {
      if (state.toastQueue[0]?.id === action.payload) {
        state.toastQueue.shift();
      }
    },
    setUnitResult: (state, action: PayloadAction<UnitResult>) => {
      state.unitResult = action.payload;
    },
    clearUnitResult: (state) => {
      state.unitResult = null;
    },
  },
});

export const {
  queueProgressToast,
  removeProgressToast,
  setUnitResult,
  clearUnitResult,
} = progressNotificationSlice.actions;

export const nextProgressToastSel = (state: RootState) =>
  state.progressNotification.toastQueue[0] ?? null;
export const unitResultSel = (state: RootState) =>
  state.progressNotification.unitResult;

export default progressNotificationSlice.reducer;
