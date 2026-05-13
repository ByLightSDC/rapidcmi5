// Mirrors TeamConsolesContent in packages/common/src/lib/types/teamConsoles.ts.
import { z } from 'zod/v4';
import {
  KSATElementSchema,
  MoveOnCriteriaEnum,
} from '@rapid-cmi5/cmi5-build-common';

export const TeamConsolesContentSchema = z.object({
  // BaseActivity fields
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  // TeamConsolesContent fields
  uuid: z.string(),
  name: z.string(),
});
