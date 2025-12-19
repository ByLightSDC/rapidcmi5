import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  AnswerType,
  CTFContent,
  QuizCompletionEnum,
} from '@rapid-cmi5/cmi5-build/common';

type tCTFState = {
  currentQuestion: number;
  currentAnswers: { [key: number]: AnswerType };
  currentGrades: { [key: number]: undefined | 0 | 1 };
  score: number;
  submitted: boolean;
};

interface State {
  auCTF: tCTFState;
}

const initialState: tCTFState = {
  currentQuestion: 0,
  currentAnswers: {} as { [key: number]: AnswerType },
  currentGrades: {} as { [key: number]: undefined | 0 | 1 },
  score: 0,
  submitted: false,
};

export const ctfSlice = createSlice({
  name: 'auCTF',
  initialState,
  reducers: {
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
      state.currentAnswers = [];
      state.currentQuestion = 0;
      state.currentGrades = {};
      state.currentAnswers = {};
      state.score = 0;
      state.submitted = false;
    },
  },
});

export function getCurrentCTFQuestion(state: State): number {
  return state.auCTF.currentQuestion;
}

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
  return Object.values(state.auCTF.currentAnswers);
  //return state.auCTF.currentAnswers;
}

export function getCTFGrades(state: any): { [key: number]: undefined | 0 | 1 } {
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
  setCurrentCTFQuestion,
  setSelectAllCTFAnswer,
  setCurrentCTFAnswer,
  setCurrentCTFGrade,
  setCTFScore,
  resetCTFActivity,
} = ctfSlice.actions;

export const ctfReducer = ctfSlice.reducer;
