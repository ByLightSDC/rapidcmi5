// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity } from './activity';

export type QuizContent = BaseActivity & {
  title?: string;
  questions: Array<QuizQuestion>;
  cmi5QuizId: string; //TODO move this to the slide level and make it optional (rename activityId, completionId, eventId )
  completionRequired?: QuizCompletionEnum; // Optional for backward compatibility; synced with moveOnCriteria
  passingScore: number;
  // For course editor data
  metadata?: string;
};

export type QuizState = {
  currentQuestion?: number;
  answers?: Array<AnswerType>;
  quizId: string;
  slideNumber: number;
};

export type QuizQuestion = {
  question: string;
  type: QuestionResponse;
  typeAttributes: BasicResponse; //TODO typeAttributes = answer
  cmi5QuestionId: string;
};

export enum QuestionResponse {
  FreeResponse = 'freeResponse',
  Number = 'number',
  MultipleChoice = 'multipleChoice',
  Matching = 'matching',
  TrueFalse = 'trueFalse',
  SelectAll = 'selectAll',
}
export const responseOptions = Object.values(QuestionResponse);

export type BasicResponse = {
  correctAnswer: string | number;
  grading: QuestionGrading;
  options?: Array<QuizOption> | undefined;
  matching?: Array<MatchingOption> | undefined;
  shuffleAnswers?: boolean;
};

export enum QuestionGrading {
  None = 'none',
  Exact = 'exact',
}
export const gradingOptions = Object.values(QuestionGrading);

export type QuizOption = {
  text: string;
  correct: boolean;
};

export type MatchingOption = {
  option: string;
  response: string;
};

export enum QuizCompletionEnum {
  Attempted = 'attempted',
  Passed = 'passed',
  Completed = 'completed',
  CompletedAndPassed = 'completed-and-passed',
  NotApplicable = 'not-applicable',
}
export const completionOptions = Object.values(QuizCompletionEnum);

export type AnswerType = number | number[] | string | string[] | null;

export type QuizScore = {
  allAnswers: AnswerType[];
};

export interface ReviewProps {
  question: QuizQuestion;
  answer: AnswerType;
}
