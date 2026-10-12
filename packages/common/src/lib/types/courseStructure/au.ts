import z from 'zod/v4';
import { KSATElementSchema } from '../activities/ksat';
import { SlideSchema } from './slide';
import { MoveOnCriteriaEnum } from '../activities/baseActivity';

export const CourseAuSchema = z.object({
  auName: z.string().describe('Human-readable AU/lesson name.'),
  assetsPath: z.string().optional(),
  description: z.string().optional(),
  promptClassId: z.boolean().optional(),
  defaultClassId: z.string().optional(),
  moveOn: z
    .enum([
      'Passed',
      'Completed',
      'CompletedAndPassed',
      'CompletedOrPassed',
      'NotApplicable',
    ])
    .optional(),
  slides: z.array(SlideSchema),
  title: z.string().optional(),
  rangeosScenarioName: z.string().optional(),
  rangeosScenarioUUID: z.string().optional(),
  rangeosScenarioDraftUUID: z.string().optional(),
  teamSSOEnabled: z.boolean().optional(),
  dirPath: z
    .string()
    .describe(
      'AU folder name relative to the course root, lowercase with dashes, e.g. "introduction".',
    ),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  slideDwellSeconds: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Seconds a learner must stay on a slide without activities before it is credited, unless they scroll to the bottom first. Defaults to 60; 0 credits a slide as soon as it is viewed.',
    ),
});

export const DEFAULT_SLIDE_DWELL_SECONDS = 60;

export type CourseAU = z.infer<typeof CourseAuSchema>;
