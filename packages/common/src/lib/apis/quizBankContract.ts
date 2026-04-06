/**
 * This file determines the contract between rapid cmi5 and any backend that wishes to interact with it
 * A backend can be generated that conforms to this url contract by using
 *  https://ts-rest.com/server/express is an example with express
 */

import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { QuestionGrading, QuestionResponse, QuizQuestion } from '../types/quiz';

const c = initContract();

const QuizOptionSchema = z.object({
  text: z.string(),
  correct: z.boolean(),
});

const MatchingOptionSchema = z.object({
  option: z.string(),
  response: z.string(),
});

export type QuestionResponseApi = z.infer<typeof QuestionResponseApiSchema>;

const QuestionResponseApiSchema = z.enum([
  'freeResponse',
  'number',
  'multipleChoice',
  'matching',
  'trueFalse',
  'selectAll',
]);

export type QuestionGradingApi = z.infer<typeof QuestionGradingApiSchema>;
const QuestionGradingApiSchema = z.enum(['none', 'exact']);

export type QuestionBankApi = z.infer<typeof QuestionBankApiSchema>;

const QuestionBankApiSchema = z.object({
  uuid: z.string(),
  author: z.string(),
  dateCreated: z.string(),
  dateEdited: z.string(),
  tags: z.array(z.string()),
  rc5QuizBankApiVersion: z.number(),
  publicQuestion: z.boolean(),
  question: z.string(),
  questionType: QuestionResponseApiSchema,
  cmi5QuestionId: z.string(),
  correctAnswer: z.union([z.string(), z.number()]),
  grading: QuestionGradingApiSchema,
  options: z.array(QuizOptionSchema).optional(),
  matching: z.array(MatchingOptionSchema).optional(),
  shuffleAnswers: z.boolean().optional(),
});

export type QuestionBankApiCreate = z.infer<typeof QuestionBankApiCreateSchema>;

export const QuestionBankApiCreateSchema = QuestionBankApiSchema.pick({
  question: true,
  tags: true,
  rc5QuizBankApiVersion: true,
  publicQuestion: true,
  questionType: true,
  grading: true,
  options: true,
  matching: true,
  shuffleAnswers: true,
  cmi5QuestionId: true,
  correctAnswer: true,
});

const QuestionBankApiUpdateSchema = QuestionBankApiCreateSchema.partial();

export const QuestionBankQuerySchema = z.object({
  dateCreated: z.string().optional(),
  dateEdited: z.string().optional(),
  author: z.string().optional(),
  questionType: QuestionResponseApiSchema.optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['dateCreated', 'dateEdited']).optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

const PaginatedQuestionBankResponseSchema = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(0),
  totalCount: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  data: z.array(QuestionBankApiSchema),
});

export const quizBankContract = c.router({
  getQuestions: {
    method: 'GET',
    path: '/v1/quiz-bank/question-bank',
    query: QuestionBankQuerySchema,
    responses: {
      200: PaginatedQuestionBankResponseSchema,
    },
    summary: 'Retrieve the list of questions from the quiz bank.',
  },
  createQuestion: {
    method: 'POST',
    path: '/v1/quiz-bank/question-bank',
    body: QuestionBankApiCreateSchema,
    responses: {
      201: QuestionBankApiSchema,
    },
    summary: 'Create a new question in the quiz bank.',
  },
  updateQuestion: {
    method: 'PUT',
    path: '/v1/quiz-bank/question-bank/:uuid',
    pathParams: z.object({ uuid: z.string() }),
    body: QuestionBankApiUpdateSchema,
    responses: {
      200: QuestionBankApiSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Update an existing question by UUID.',
  },
  deleteQuestion: {
    method: 'DELETE',
    path: '/v1/quiz-bank/question-bank/:uuid',
    pathParams: z.object({ uuid: z.string() }),
    body: c.noBody(),
    responses: {
      200: z.object({ uuid: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Delete a question by UUID.',
  },
});

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

export const currentQuizBankApiVersion = 1;

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
