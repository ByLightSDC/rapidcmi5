import { z } from 'zod/v4';
import {
  KSATElementSchema,
  MoveOnCriteriaEnum,
} from '@rapid-cmi5/cmi5-build-common';

export const ScenarioContentSchema = z.object({
  // BaseActivity fields
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  // RC5ScenarioContent fields
  uuid: z.string(),
  name: z.string().optional(),
  promptClass: z.boolean().optional(),
  defaultClassId: z.string().optional(),
  cmi5QuizId: z.string().optional(),
});
