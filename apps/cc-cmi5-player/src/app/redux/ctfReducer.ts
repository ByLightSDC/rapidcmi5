// import { createSlice } from '@reduxjs/toolkit';
// import { RootState } from './store';
// import { AnswerType, QuizType } from '../types/QuizState';
// import { debuglog } from 'util';
// import { CTFContentType } from '../components/ctf/ctfSchema';

// const initialState = {
//   quiz: {} as CTFContentType,
//   currentQuestion: 0,
//   currentAnswers: {} as { [key: number]: AnswerType },
//   currentGrades: {} as { [key: number]: undefined | 0 | 1 },
//   score: 0,
//   submitted: false,
// };

// export const ctfSlice = createSlice({
//   name: 'ctf',
//   initialState,
//   reducers: {
//     setCTFQuiz: (state, action) => {
//       state.quiz = action.payload;
//     },
//     setCurrentQuestion: (state, action) => {
//       if (action.payload < state.quiz.questions.length && action.payload >= 0) {
//         state.currentQuestion = action.payload;
//       }
//     },
//     setCurrentAnswer: (state, action) => {
//       const answer = action.payload;
//       const questionIndex = state.currentQuestion;
//       state.currentAnswers[questionIndex] = answer;
//     },
//     setCurrentGrade: (state, action) => {
//       const grade = action.payload;
//       const questionIndex = state.currentQuestion;
//       state.currentGrades[questionIndex] = grade;
//     },
//     // setSelectAllAnswer: (state, action) => {
//     //   const answer = action.payload;
//     //   const questionIndex = state.currentQuestion;

//     //   let answers = state.currentAnswers[questionIndex] as number[];
//     //   if (!answers) {
//     //     answers = [] as number[];
//     //   }
//     //   if (answers.includes(answer)) {
//     //     answers = answers.filter((item) => item !== answer);
//     //   } else {
//     //     answers.push(answer);
//     //   }
//     //   state.currentAnswers[questionIndex] = answers;
//     // },
//     setScore: (state, action) => {
//       state.score = action.payload;
//       state.submitted = true;
//     },
//     resetAnswers: (state) => {
//       //state.currentAnswers = [] as AnswerType[];
//       state.currentAnswers = initialState.currentAnswers;
//       state.currentGrades = initialState.currentGrades;
//       state.score = initialState.score;
//       state.currentQuestion = initialState.currentQuestion;
//     },
//     resetCTFQuiz: (state) => {
//       state.currentAnswers = [] as AnswerType[];
//       state.currentQuestion = 0;
//       state.quiz = {} as CTFContentType;
//       state.score = 0;
//       state.submitted = false;
//     },
//   },
// });

// export function getCTFQuiz(state: RootState): CTFContentType {
//   return state.ctf.quiz;
// }

// export function getCurrentQuestion(state: RootState): number {
//   return state.ctf.currentQuestion;
// }

// export function getCurrentAnswer(state: RootState): AnswerType {
//   const questionIndex = state.ctf.currentQuestion;
//   return state.ctf.currentAnswers[questionIndex];
// }

// // export function getCurrentAnswers(state: any): AnswerType  {
// //   const questionIndex = state.quiz.currentQuestion;
// //   if (state.ctf.currentAnswers[questionIndex] === undefined) {
// //     return [];
// //   }
// //   return state.ctf.currentAnswers[questionIndex];
// // }

// export function getAllAnswers(state: any): AnswerType[] {
//   return state.ctf.currentAnswers;
// }

// export function getGrades(state: any): { [key: number]: undefined | 0 | 1 } {
//   return state.ctf.currentGrades;
// }

// export function getScore(state: RootState): number {
//   return state.ctf.score;
// }

// // export function getSubmitted(state: RootState): boolean {
// //   return state.ctf.submitted;
// // }

// // Action creators are generated for each case reducer function
// export const {
//   setCTFQuiz,
//   setCurrentQuestion,
//   setCurrentAnswer,
//   setCurrentGrade,
//   setScore,
//   resetAnswers,
//   resetCTFQuiz,
// } = ctfSlice.actions;

// export default ctfSlice.reducer;
