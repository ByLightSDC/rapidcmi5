import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  AnswerType,
  CTFContent,
  CTFState,
  QuizCompletionEnum,
} from '@rapid-cmi5/cmi5-build-common';

export type CTFActivityState = {
  currentQuestion: number;
  currentAnswers: Record<string, AnswerType>;
  currentGrades: Record<string, 0 | 1>;
  score: number;
  submitted: boolean;
};

interface State {
  auCTF: CTFActivityState;
}

const initialState: CTFActivityState = {
  currentQuestion: 0,
  currentAnswers: {},
  currentGrades: {},
  score: 0,
  submitted: false,
};

export const ctfSlice = createSlice({
  name: 'auCTF',
  initialState,
  reducers: {
    hydrateCTFActivity: (state, action: PayloadAction<CTFState>) => {
      state.currentQuestion = action.payload.currentQuestion;
      state.currentAnswers = action.payload.answers;
      state.currentGrades = action.payload.grades;
      state.score = action.payload.score;
      state.submitted = action.payload.submitted;
    },
    setCurrentCTFQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestion = action.payload;
    },
    setCurrentCTFAnswer: (state, action: PayloadAction<AnswerType>) => {
      state.currentAnswers[state.currentQuestion] = action.payload;
    },
    setCurrentCTFGrade: (state, action) => {
      state.currentGrades[state.currentQuestion] = action.payload;
    },
    setSelectAllCTFAnswer: (state, action) => {
      const answer = action.payload;
      const questionIndex = state.currentQuestion;

      let answers = state.currentAnswers[questionIndex] as number[];
      if (!answers) {
        answers = [] as number[];
      }
      if (answers.includes(answer)) {
        answers = answers.filter((item) => item !== answer);
      } else {
        answers.push(answer);
      }
      state.currentAnswers[questionIndex] = answers;
    },
    setCTFScore: (state, action) => {
      state.score = action.payload;
      state.submitted = true;
    },
    resetCTFActivity: (state) => {
      state.currentQuestion = 0;
      state.currentGrades = {};
      state.currentAnswers = {};
      state.score = 0;
      state.submitted = false;
    },
  },
});

export function getCurrentCTFAnswer(state: State): AnswerType {
  const questionIndex = state.auCTF.currentQuestion;
  return state.auCTF.currentAnswers[questionIndex];
}

export function getCurrentCTFAnswers(state: State): AnswerType {
  const questionIndex = state.auCTF.currentQuestion;
  if (state.auCTF.currentAnswers[questionIndex] === undefined) {
    return [];
  }
  return state.auCTF.currentAnswers[questionIndex];
}

export function getAllCTFAnswers(state: State): AnswerType[] {
  return Object.entries(state.auCTF.currentAnswers).reduce<AnswerType[]>(
    (answers, [index, answer]) => {
      answers[Number(index)] = answer;
      return answers;
    },
    [],
  );
}

export function getCTFGrades(state: State): Record<string, 0 | 1> {
  return state.auCTF.currentGrades;
}

export function getCTFScore(state: State): number {
  return state.auCTF.score;
}

export function getCTFSubmitted(state: State): boolean {
  return state.auCTF.submitted;
}

// Action creators are generated for each case reducer function
export const {
  hydrateCTFActivity,
  setCurrentCTFQuestion,
  setSelectAllCTFAnswer,
  setCurrentCTFAnswer,
  setCurrentCTFGrade,
  setCTFScore,
  resetCTFActivity,
} = ctfSlice.actions;

export const currentAnswers = (state: State) => state.auCTF.currentAnswers;
export const getCurrentQuestion = (state: State): number =>
  state.auCTF.currentQuestion;

export const ctfReducer = ctfSlice.reducer;
