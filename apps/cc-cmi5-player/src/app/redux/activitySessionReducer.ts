import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CTFState, QuizState } from '@rapid-cmi5/cmi5-build-common';

interface ActivitySessionState {
  quizCache: Record<string, QuizState>;
  ctfCache: Record<string, CTFState>;
  autoGraderCache: string[] | null;
}

const initialActivityState = {
  quizCache: {},
  ctfCache: {},
  autoGraderCache: null,
} as ActivitySessionState;

const activitySessionSlice = createSlice({
  name: 'activitySession',
  initialState: initialActivityState,
  reducers: {
    setEntireCTFState(
      state,
      action: PayloadAction<{ key: string; value: CTFState }>,
    ) {
      state.ctfCache[action.payload.key] = action.payload.value;
    },
    setEntireQuizState(
      state,
      action: PayloadAction<{ key: string; value: QuizState }>,
    ) {
      state.quizCache[action.payload.key] = action.payload.value;
    },
    setQuizAnswers(
      state,
      action: PayloadAction<{ key: string; answers: QuizState['answers'] }>,
    ) {
      const { key, answers } = action.payload;
      if (!state.quizCache[key]) {
        state.quizCache[key] = {
          answers: answers,
          currentQuestion: 0,
          quizId: 'quiz',
          slideNumber: 0,
        }; // or some default QuizState
      } else {
        state.quizCache[key].answers = answers;
      }
    },
    setQuizCurrentQuestion(
      state,
      action: PayloadAction<{
        key: string;
        currentQuestion: QuizState['currentQuestion'];
      }>,
    ) {
      const { key, currentQuestion } = action.payload;
      if (!state.quizCache[key]) {
        state.quizCache[key] = {
          currentQuestion,
          quizId: 'quiz',
          slideNumber: 0,
        };
      } else {
        state.quizCache[key].currentQuestion = currentQuestion;
      }
    },
    addAutoGraderUUID(state, action: PayloadAction<string>) {
      if (!state.autoGraderCache) {
        state.autoGraderCache = [];
      }
      state.autoGraderCache.push(action.payload);
    },
    setAllAutoGraderUUIDs(state, action: PayloadAction<string[]>) {
      state.autoGraderCache = action.payload;
    },
  },
});

export const {
  setEntireCTFState,
  setEntireQuizState,
  setQuizAnswers,
  setQuizCurrentQuestion,
  setAllAutoGraderUUIDs,
  addAutoGraderUUID,
} = activitySessionSlice.actions;

export default activitySessionSlice.reducer;
