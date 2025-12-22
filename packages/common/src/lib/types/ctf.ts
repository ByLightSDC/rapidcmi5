// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity } from './activity';
import { QuestionGrading, QuizCompletionEnum } from './quiz';

/**
 * @typedef {string} title Activity Title
 * @property {Array<CTFQuestion>} questions Questions
 * @property {string} cmi5QuizId CMI5 Quiz Id
 * @property {QuizCompletionEnum} [completionRequired = 'passed'] Whether student must pass or attempt
 * @property {number} [passingScore = 80] Score requirement for pass/fail (0-100)
 * @property {CTFDisplay} [display] Display Settings
 */
export type CTFContent = BaseActivity & {
  title?: string;
  questions: Array<CTFQuestion>;
  cmi5QuizId: string;
  completionRequired?: QuizCompletionEnum;
  passingScore: number;
  display?: CTFDisplay;
};

/**
 * @typedef {Object} CTFQuestion
 * @property {string} [title] Question Title
 * @property {string} question Question
 * @property {CTFResponse} type Question format
 * @property {BasicCFTResponse} typeAttributes Question response grading options
 * @property {string} cmi5QuestionId CMI5 Question Id
 */
export type CTFQuestion = {
  title?: string;
  question: string;
  type: CTFResponse;
  typeAttributes: BasicCFTResponse;
  cmi5QuestionId: string;
};

export enum CTFResponse {
  FreeResponse = 'freeResponse',
}

export type BasicCFTResponse = {
  correctAnswer: string | number;
  grading: QuestionGrading; //from quiz
  options?: Array<CTFQuizOption> | undefined;
};

export type CTFQuizOption = {
  text: string;
  correct: boolean;
};

/**
 * @typedef {Object} CTFDisplay
 * @property {boolean} [shouldNumberQuestions] Whether questions should be numbered
 */
export type CTFDisplay = {
  shouldNumberQuestions?: boolean;
};
