import z from 'zod/v4';

import { AutoGraderEventSchema } from './autograder';
import { KSATElementSchema } from './ksat';
import { BaseActivitySchema } from './baseActivity';

export const ScenarioSubmitResponseSchema = z.object({
  completedTasks: z.number(),
  totalTasks: z.number(),
  allCompleted: z.boolean(),
  autoGraderResults: z.array(AutoGraderEventSchema),
});

export type ScenarioSubmitResponse = z.infer<
  typeof ScenarioSubmitResponseSchema
>;

export const ScenarioContentSchema = BaseActivitySchema.extend({
  defaultClassId: z.string().optional(),
  uuid: z.string(),
  name: z.string(),
  promptClassId: z.boolean().optional(),
  promptClass: z.boolean().optional(),
  cmi5QuizId: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
});

export type ScenarioContent = z.infer<typeof ScenarioContentSchema>;
