// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { z } from 'zod/v4';
import { KSATElementSchema } from './ksat';
import { BaseActivitySchema } from './baseActivity';

export enum QuestionResponse {
  FreeResponse = 'freeResponse',
  Number = 'number',
  MultipleChoice = 'multipleChoice',
  Matching = 'matching',
  TrueFalse = 'trueFalse',
  SelectAll = 'selectAll',
}

export const responseOptions = Object.values(QuestionResponse);

export enum QuestionGrading {
  None = 'none',
  Exact = 'exact',
}

export const gradingOptions = Object.values(QuestionGrading);

export enum QuizCompletionEnum {
  Attempted = 'attempted',
  Passed = 'passed',
  Completed = 'completed',
  CompletedAndPassed = 'completed-and-passed',
  NotApplicable = 'not-applicable',
}

export const completionOptions = Object.values(QuizCompletionEnum);

export const AnswerSchema = z.union([
  z.number(),
  z.array(z.number()),
  z.string(),
  z.array(z.string()),
  z.null(),
]);

export const QuizOptionSchema = z.object({
  text: z.string(),
  correct: z.boolean(),
});

export const MatchingOptionSchema = z.object({
  option: z.string(),
  response: z.string(),
});

export const BasicResponseSchema = z.object({
  correctAnswer: z.union([z.string(), z.number()]),
  grading: z.enum(QuestionGrading),
  options: z.array(QuizOptionSchema).optional(),
  matching: z.array(MatchingOptionSchema).optional(),
  shuffleAnswers: z.boolean().optional(),
});

export const QuizQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(QuestionResponse),
  typeAttributes: BasicResponseSchema,
  cmi5QuestionId: z.string(),
});

export const QuizContentSchemaZod = BaseActivitySchema.extend({
  // QuizContent fields
  title: z.string().optional(),
  questions: z.array(QuizQuestionSchema),
  // TODO move this to the slide level and make it optional (rename activityId, completionId, eventId)
  cmi5QuizId: z.string(),
  // Optional for backward compatibility; synced with moveOnCriteria
  completionRequired: z.enum(QuizCompletionEnum).optional(),
  passingScore: z.number(),
  metadata: z.string().optional(),
});
export const QuizContentSchema = z.toJSONSchema(QuizContentSchemaZod);

export const QuizStateSchema = z.object({
  currentQuestion: z.number().optional(),
  answers: z.array(AnswerSchema).optional(),
  quizId: z.string(),
  slideNumber: z.number(),
});

export const QuizScoreSchema = z.object({
  allAnswers: z.array(AnswerSchema),
});

export const ReviewPropsSchema = z.object({
  question: QuizQuestionSchema,
  answer: AnswerSchema,
});

export type AnswerType = z.infer<typeof AnswerSchema>;
export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type MatchingOption = z.infer<typeof MatchingOptionSchema>;
export type BasicResponse = z.infer<typeof BasicResponseSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizContent = z.infer<typeof QuizContentSchemaZod>;
export type QuizState = z.infer<typeof QuizStateSchema>;
export type QuizScore = z.infer<typeof QuizScoreSchema>;
export type ReviewProps = z.infer<typeof ReviewPropsSchema>;
