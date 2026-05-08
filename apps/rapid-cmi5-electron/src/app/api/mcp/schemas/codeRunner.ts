// Mirrors CodeRunnerContent in packages/common/src/lib/types/codeRunner.ts.
import { z } from 'zod/v4';
import {
  KSATElementSchema,
  MoveOnCriteriaEnum,
} from '@rapid-cmi5/cmi5-build-common';

export const CodeRunnerContentSchema = z.object({
  // BaseActivity fields
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  // CodeRunnerContent fields
  title: z.string(),
  description: z.string(),
  evaluator: z.string().min(1),
  student: z.string().min(1),
  cmi5QuizId: z.string(),
  programmingLanguage: z.string(),
  languageVersion: z.string(),
});
