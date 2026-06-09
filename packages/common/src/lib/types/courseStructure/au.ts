import z from 'zod/v4';
import { KSATElementSchema } from '../activities/ksat';
import { ThemeSchema } from '../ui/theme';
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
  lessonTheme: ThemeSchema.optional(),
});

export type CourseAU = z.infer<typeof CourseAuSchema>;
