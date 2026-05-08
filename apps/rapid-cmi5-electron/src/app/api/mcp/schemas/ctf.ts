import { z } from 'zod/v4';
import {
  KSATElementSchema,
  MoveOnCriteriaEnum,
  QuestionGrading,
  QuizCompletionEnum,
} from '@rapid-cmi5/cmi5-build-common';

const CTFQuizOptionSchema = z.object({
  text: z.string(),
  correct: z.boolean(),
});

const BasicCTFResponseSchema = z.object({
  correctAnswer: z.union([z.string(), z.number()]),
  grading: z.enum(QuestionGrading),
  options: z.array(CTFQuizOptionSchema).optional(),
});

const CTFQuestionSchema = z.object({
  title: z.string().optional(),
  question: z.string(),
  type: z.literal('freeResponse'),
  typeAttributes: BasicCTFResponseSchema,
  cmi5QuestionId: z.string(),
});

const CTFDisplaySchema = z.object({
  shouldNumberQuestions: z.boolean().optional(),
});

export const CTFContentSchema = z.object({
  // BaseActivity fields
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  // CTFContent fields
  title: z.string().optional(),
  questions: z.array(CTFQuestionSchema),
  cmi5QuizId: z.string(),
  completionRequired: z.enum(QuizCompletionEnum).optional(),
  passingScore: z.number().min(0).max(100),
  display: CTFDisplaySchema.optional(),
});
