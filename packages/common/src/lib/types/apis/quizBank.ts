// These values and types are repeated but for a good reason
// Please do not edit these values
// These are a contract with any API for v1 of the quiz bank
// You can change the internal types however you like, but these must remain
// If you do want to change internal types, please ensure that they still fit into the 
// conversion function

import { QuestionGrading, QuestionResponse, QuizQuestion } from '../quiz';

// If you need to make a newer version for the api, please create a V2 object
export const currentQuizBankApiVersion = 1;

export type QuestionResponseApi =
  | 'freeResponse'
  | 'number'
  | 'multipleChoice'
  | 'matching'
  | 'trueFalse'
  | 'selectAll';
export type QuestionGradingApi = 'none' | 'exact';

export type QuizOptionApi = {
  text: string;
  correct: boolean;
};

export type MatchingOptionApi = {
  option: string;
  response: string;
};

// The full API response shape (GET)
export interface QuestionBankApi {
  uuid: string;
  author: string;
  dateCreated: string;
  dateEdited: string;
  tags: string[];
  rc5QuizBankApiVersion: number;
  publicQuestion: boolean;
  question: string;
  questionType: QuestionResponseApi;
  cmi5QuestionId: string;
  correctAnswer: string | number;
  grading: QuestionGradingApi;
  options?: Array<QuizOptionApi> | undefined;
  matching?: Array<MatchingOptionApi> | undefined;
  shuffleAnswers?: boolean;
}

// POST — only the fields the client controls
export type QuestionBankApiCreate = Pick<
  QuestionBankApi,
  | 'question'
  | 'tags'
  | 'rc5QuizBankApiVersion'
  | 'publicQuestion'
  | 'questionType'
  | 'grading'
  | 'options'
  | 'matching'
  | 'shuffleAnswers'
  | 'cmi5QuestionId'
  | 'correctAnswer'
>;

// PUT/PATCH — same fields as create, all optional
export type QuestionBankApiUpdate = Partial<QuestionBankApiCreate>;

// These are used to constrain the values
const responseApiMap: Record<QuestionResponseApi, QuestionResponse> = {
  freeResponse: QuestionResponse.FreeResponse,
  number: QuestionResponse.Number,
  multipleChoice: QuestionResponse.MultipleChoice,
  matching: QuestionResponse.Matching,
  trueFalse: QuestionResponse.TrueFalse,
  selectAll: QuestionResponse.SelectAll,
};

const gradingApiMap: Record<QuestionGradingApi, QuestionGrading> = {
  none: QuestionGrading.None,
  exact: QuestionGrading.Exact,
};



// If you need to convert the inner type
export function convertFromApi(apiObj: QuestionBankApi): QuizQuestion {
  return {
    type: responseApiMap[apiObj.questionType],
    cmi5QuestionId: apiObj.cmi5QuestionId,
    question: apiObj.question,
    typeAttributes: {
      correctAnswer: apiObj.correctAnswer,
      grading: gradingApiMap[apiObj.grading],
      options: apiObj.options,
      matching: apiObj.matching,
      shuffleAnswers: apiObj.shuffleAnswers,
    },
  };
}
