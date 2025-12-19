import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

import { rangeDataType, rangeConsoleDataType } from '../types/AuState';
import { CourseAU } from '@rapid-cmi5/cmi5-build/common';
import { defaultCourseAuData } from '../session/constants';
import { CourseAUProgress } from '../types/CourseAUProgress';
import { initializeCourseAUProgress as createCourseAUProgress } from '../utils/CourseAUProgressHelpers';
import { logger } from '../debug';

type tAuState = {
  auLogo: string;
  auPath: string;
  auProgress: number;
  auViewedSlides: number[];
  auInitStatement: string;
  auJson: CourseAU;
  classId?: string;
  isConfigInitialized: boolean;
  isDisplayInitialized: boolean;
  isSessionInitialized: boolean;
  rangeData: rangeDataType;
  rangeConsoleData: rangeConsoleDataType;
  rangeDataError?: string;
  rangeConsoleDataError?: string;
  rangeDataAttempts: number;
  rangeConsoleDataAttempts: number;
  studentId: string;

  // New consolidated progress tracking
  courseAUProgress?: CourseAUProgress;
};

//Defaults
export const initialState: tAuState = {
  auLogo: '',
  auPath: '',
  auProgress: 0,
  auViewedSlides: [],
  auInitStatement: '',
  auJson: defaultCourseAuData,
  classId: '',
  isConfigInitialized: false,
  isDisplayInitialized: false,
  isSessionInitialized: false,
  rangeData: {
    rangeId: '',
    deployedScenarios: [],
  } as rangeDataType,
  rangeConsoleData: {
    credentials: [],
  } as rangeConsoleDataType,
  rangeDataAttempts: 0,
  rangeConsoleDataAttempts: 0,
  studentId: '',
  courseAUProgress: undefined,
};

export const auSlice = createSlice({
  name: 'au',
  initialState,
  reducers: {
    setAuPath: (state, action) => {
      state.auPath = action.payload;
    },
    setAuJson: (state, action) => {
      state.auJson = action.payload;
    },
    setAuLogo: (state, action) => {
      state.auLogo = action.payload;
    },
    setAuProgress: (state, action) => {
      state.auProgress = action.payload;

      // Sync with new CourseAUProgress system
      if (state.courseAUProgress) {
        state.courseAUProgress.progress.auProgress = action.payload;
        state.courseAUProgress.lastUpdated = new Date().toISOString();
      }
    },
    setAuViewedSlides: (state, action) => {
      state.auViewedSlides = action.payload;
    },
    setAuInitStatment: (state, action) => {
      state.auInitStatement = action.payload;
    },
    setClassId: (state, action) => {
      state.classId = action.payload;
    },
    setIsConfigInitialized: (state, action) => {
      state.isConfigInitialized = action.payload;
    },
    setIsDisplayInitialized: (state, action) => {
      state.isDisplayInitialized = action.payload;
    },
    setIsSessionInitialized: (state, action) => {
      state.isSessionInitialized = action.payload;
    },
    setRangeData: (state, action) => {
      state.rangeData = action.payload;
    },
    setRangeConsoleData: (state, action) => {
      state.rangeConsoleData = action.payload;
    },
    setRangeDataError: (state, action) => {
      state.rangeDataError = action.payload;
    },
    setRangeConsoleDataError: (state, action) => {
      state.rangeConsoleDataError = action.payload;
    },
    setRangeDataAttempts: (state, action) => {
      state.rangeDataAttempts = action.payload;
    },
    setRangeConsoleDataAttempts: (state, action) => {
      state.rangeConsoleDataAttempts = action.payload;
    },
    setStudentId: (state, action) => {
      state.studentId = action.payload;
    },
    // CourseAUProgress actions
    initializeCourseAUProgress: (state, action) => {
      const { auJson, auProgress, auViewedSlides } = action.payload;

      logger.debug(
        'Redux: Initializing CourseAUProgress',
        {
          auName: auJson.auName,
          auTitle: auJson.title,
          totalSlides: auJson.slides?.length || 0,
          auProgress,
          auViewedSlides,
          // Note: currentSlide is now tracked in navigationSlice.activeTab
        },
        'auManager',
      );

      state.courseAUProgress = createCourseAUProgress({
        auJson,
        auProgress,
        auViewedSlides,
        // Note: currentSlide is now tracked in navigationSlice.activeTab
      });

      logger.debug(
        'Redux: CourseAUProgress initialized',
        {
          auId: state.courseAUProgress?.courseStructure.auId,
          totalSlides: state.courseAUProgress?.courseStructure.totalSlides,
          totalActivities: Object.keys(
            state.courseAUProgress?.slideActivitiesMeta || {},
          ).reduce(
            (sum, slideGuid) =>
              sum +
              Object.keys(
                state.courseAUProgress?.slideActivitiesMeta[slideGuid] || {},
              ).length,
            0,
          ),
        },
        'auManager',
      );
    },

    setCourseAUProgress: (state, action) => {
      state.courseAUProgress = action.payload;
      logger.debug(
        'Redux: courseAUProgress set successfully',
        {
          newValue: state.courseAUProgress,
        },
        'auManager',
      );
    },

    // Activity-level actions

    // New action for updating activity status (completion and passing)
    updateActivityStatus: (state, action) => {
      const { activityId, activityStatus } = action.payload;

      logger.debug(
        'Redux: Updating activity status',
        {
          activityId,
          previousStatus:
            state.courseAUProgress?.progress.activityStatus[activityId],
          newStatus: activityStatus,
        },
        'auManager',
      );

      if (state.courseAUProgress?.progress.activityStatus) {
        state.courseAUProgress.progress.activityStatus[activityId] =
          activityStatus;
        state.courseAUProgress.lastUpdated = new Date().toISOString();
      }
    },
  },
});

// export actions to dispatch from components
export const {
  setAuPath,
  setAuJson,
  setAuLogo,
  setAuProgress,
  setAuViewedSlides,
  setAuInitStatment,
  setClassId,
  setIsConfigInitialized,
  setIsDisplayInitialized,
  setIsSessionInitialized,
  setRangeData,
  setRangeConsoleData,
  setRangeDataError,
  setRangeConsoleDataError,
  setRangeDataAttempts,
  setRangeConsoleDataAttempts,
  setStudentId,
  // CourseAUProgress actions
  initializeCourseAUProgress,
  setCourseAUProgress,
  updateActivityStatus,
} = auSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const auLogoSel = (state: RootState) => state.au.auLogo;
export const classIdSel = (state: RootState) => state.au.classId;
export const studentIdSel = (state: RootState) => state.au.studentId;
export const auPathSel = (state: RootState) => state.au.auPath;
export const auProgressSel = (state: RootState) => state.au.auProgress;
export const auViewedSlidesSel = (state: RootState) => state.au.auViewedSlides;
export const auInitStatementSel = (state: RootState) =>
  state.au.auInitStatement;
export const auJsonSel = (state: RootState) => state.au.auJson;
export const auSessionInitializedSel = (state: RootState) =>
  state.au.isSessionInitialized;
export const auConfigInitializedSel = (state: RootState) =>
  state.au.isConfigInitialized;
export const auDisplayInitializedSel = (state: RootState) =>
  state.au.isDisplayInitialized;
export const rangeDataSel = (state: RootState) => state.au.rangeData;
export const rangeConsoleDataSel = (state: RootState) =>
  state.au.rangeConsoleData;
export const rangeDataErrorSel = (state: RootState) => state.au.rangeDataError;
export const rangeConsoleDataErrorSel = (state: RootState) =>
  state.au.rangeConsoleDataError;
export const rangeDataAttemptsSel = (state: RootState) =>
  state.au.rangeDataAttempts;
export const rangeConsoleDataAttemptsSel = (state: RootState) =>
  state.au.rangeConsoleDataAttempts;
export const courseAUProgressSel = (state: RootState) => {
  const value = state.au.courseAUProgress;
  return value;
};

export default auSlice.reducer;
