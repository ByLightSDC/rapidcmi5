// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import z from 'zod/v4';

import { QuestionGrading, QuizCompletionEnum } from './quiz';
import { BaseActivitySchema } from './baseActivity';

export enum CTFResponse {
  FreeResponse = 'freeResponse',
}

export const CTFQuizOptionSchema = z.object({
  text: z.string(),
  correct: z.boolean(),
});

export type CTFQuizOption = z.infer<typeof CTFQuizOptionSchema>;

export const BasicCFTResponseSchema = z.object({
  correctAnswer: z.union([z.string(), z.number()]),
  grading: z.enum(QuestionGrading),
  options: z.array(CTFQuizOptionSchema).optional(),
});

export type BasicCFTResponse = z.infer<typeof BasicCFTResponseSchema>;

export const CTFQuestionSchema = z.object({
  title: z.string().optional(),
  question: z.string(),
  type: z.enum(CTFResponse),
  typeAttributes: BasicCFTResponseSchema,
  cmi5QuestionId: z.string(),
});

export type CTFQuestion = z.infer<typeof CTFQuestionSchema>;

export const CTFDisplaySchema = z.object({
  shouldNumberQuestions: z.boolean().optional(),
});

export type CTFDisplay = z.infer<typeof CTFDisplaySchema>;

export const CTFContentSchema = BaseActivitySchema.extend({
  title: z.string().optional(),
  questions: z.array(CTFQuestionSchema),
  cmi5QuizId: z.string(),
  completionRequired: z.enum(QuizCompletionEnum).optional(),
  passingScore: z.number(),
  display: CTFDisplaySchema.optional(),
});

export type CTFContent = z.infer<typeof CTFContentSchema>;
