import z from 'zod/v4';
import { KSATElementSchema } from './ksat';

export enum MoveOnCriteriaEnum {
  Completed = 'completed',
  Passed = 'passed',
  CompletedAndPassed = 'completed-and-passed',
  NotApplicable = 'not-applicable',
}
export const moveOnCriteriaOptions = Object.values(MoveOnCriteriaEnum);
export const BaseActivitySchema = z.object({
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
});

export type BaseActivity = z.infer<typeof BaseActivitySchema>;
