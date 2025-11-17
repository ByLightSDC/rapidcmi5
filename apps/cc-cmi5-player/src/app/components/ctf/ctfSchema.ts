import {
  BasicResponseType,
  QuizCompletionEnum,
  QuizType,
} from '../../types/QuizState';

/**
 * @typedef {string} title Activity Title
 * @property {Array<CTFQuestionType>} questions Questions
 * @property {string} cmi5QuizId CMI5 Quiz Id
 * @property {CTFCompletionEnum} [completionRequired = 'passed'] Whether student must pass or attempt
 * @property {number} [passingScore = 80] Score requirement for pass/fail (0-100)
 * @property {CTFDisplay} [display] Display Settings
 */
export type CTFContentType = {
  title: string;
  questions: Array<CTFQuestionType>;
  cmi5QuizId: string;
  completionRequired?: QuizCompletionEnum;
  passingScore: number;
  display?: CTFDisplay;
};

/**
 * @typedef {Object} CTFQuestionType
 * @property {string} [title] Question Title
 * @property {string} question Question
 * @property {CTFResponseType} type Question format
 * @property {BasicCFTResponseType} typeAttributes Question response grading options
 * @property {string} cmi5QuestionId CMI5 Question Id
 */
export type CTFQuestionType = {
  title?: string;
  question: string;
  type: CTFResponseType;
  typeAttributes: BasicCFTResponseType;
  cmi5QuestionId: string;
};

export enum CTFResponseType {
  FreeResponse = 'freeResponse',
}

/**
 * @typedef {Object} CTFDisplay
 * @property {boolean} [shouldNumberQuestions] Whether questions should be numbered
 */
export type CTFDisplay = {
  shouldNumberQuestions?: boolean;
};

export enum QuestionGradingType {
  None = 'none',
  Exact = 'exact',
}

export type BasicCFTResponseType = {
  correctAnswer: string | number;
  grading: QuestionGradingType;
  options?: Array<CTFQuizOption> | undefined;
};

export type CTFQuizOption = {
  text: string;
  correct: boolean;
};
