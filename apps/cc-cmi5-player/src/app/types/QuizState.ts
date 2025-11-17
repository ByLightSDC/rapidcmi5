export interface IQuiz {
  title: string;
  questions: Array<IQuestionType>;
  cmi5QuizId: string;
  completionRequired?: QuizCompletionEnum;
  passingScore: number;
}

export interface IQuestionType {
  question: string;
  type: any;
  typeAttributes: any;
  cmi5QuestionId: string;
}

export type QuizType = {
  title: string;
  questions: Array<QuizQuestionType>;
  cmi5QuizId: string;
  completionRequired: QuizCompletionEnum;
  passingScore: number;
};

export enum QuizCompletionEnum {
  Attempted = 'attempted',
  Passed = 'passed',
}

export type QuizQuestionType = {
  question: string;
  type: QuestionResponseType;
  typeAttributes: BasicResponseType;
  cmi5QuestionId: string;
};

export enum QuestionResponseType {
  FreeResponse = 'freeResponse',
  Number = 'number',
  MultipleChoice = 'multipleChoice',
  TrueFalse = 'trueFalse',
  SelectAll = 'selectAll',
}

export enum QuestionGradingType {
  None = 'none',
  Exact = 'exact',
}

export type BasicResponseType = {
  correctAnswer: string | number;
  grading: QuestionGradingType;
  options?: Array<QuizOption> | undefined;
};

export type QuizOption = {
  text: string;
  correct: boolean;
};

export type AnswerType = number | number[] | string;
