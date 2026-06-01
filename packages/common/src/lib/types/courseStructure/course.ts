import { z } from 'zod/v4';
import { MoveOnCriteriaEnum } from '../activities/activity';
import { ThemeSchema } from '../ui/theme';

export enum Operation {
  // Covers deleting a slide or AU
  Delete = 'Delete',
  // Covers any change to the slide or AU
  Edit = 'Edit',
  // Covers adding a new slide or AU
  Add = 'Add',
  // Slide was created and then deleted
  Cancel = 'Cancel',
}

export const SlideSchema = z.object({
  slideTitle: z.string(),
  filepath: z
    .string()
    .describe(
      'Slide path relative to the course root, e.g. "introduction/slide-1.md".',
    ),
});

export const RunTimeSlideSchema = SlideSchema.extend({
  content: z.string().optional().describe('Markdown body of the slide.'),
});

export const KSATElementSchema = z.object({
  element_identifier: z.string().optional(),
  element_type: z.enum(['task', 'knowledge', 'skill']).optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  doc_identifier: z.string().optional(),
});

export const MetaDataSchema = z.object({
  buildTime: z.string().optional(),
  remoteGitUrl: z.string().optional(),
  gitBranch: z.string().optional(),
  rc5Version: z.string().optional(),
});

export const CourseSettings = z.object({
  courseTheme: ThemeSchema.optional(),
  metadata: MetaDataSchema.optional(),
});

export const CourseAuSchema = z.object({
  auName: z.string().describe('Human-readable AU/lesson name.'),
  assetsPath: z.string().optional(),
  description: z.string().optional(),
  backgroundImage: z.string().optional(),
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

const RuntimeCourseAuSchema = CourseAuSchema.extend({
  // These values are only filled in at build time do to the constraint
  // that an au cannot look at the entire RC5.yaml file but only the config.json
  buildTimeProps: CourseSettings,
  slides: z.array(RunTimeSlideSchema),
});

export const CourseBlockSchema = z.object({
  blockName: z.string(),
  blockDescription: z.string().optional(),
  aus: z.array(CourseAuSchema),
});

export const RuntimeBlockSchema = CourseBlockSchema.extend({
  aus: z.array(RuntimeCourseAuSchema),
});

export const CourseDataSchemaZod = z.object({
  courseTitle: z.string().describe('Human-readable course title.'),
  courseId: z
    .string()
    .describe(
      'Unique course id, typically a URL like "https://example.com/my-course".',
    ),
  courseDescription: z.string().optional(),
  author: z.string().optional(),
  buildTimeProps: CourseSettings,
  blocks: z
    .array(CourseBlockSchema)
    .describe('Top-level course blocks. Most courses have a single block.'),
});

export const RuntimeCourseDataSchemaZod = CourseDataSchemaZod.extend({
  blocks: z
    .array(RuntimeBlockSchema)
    .describe('Top-level course blocks. Most courses have a single block.'),
});

export const CreateCourseInputSchema = CourseDataSchemaZod.extend({
  repoName: z
    .string()
    .min(1)
    .describe(
      'Target project (repo) directory name. MUST be one of the names returned by the list_projects tool — call list_projects first if you do not already know it.',
    ),
});

export type Theme = z.infer<typeof ThemeSchema>;
export type MetaData = z.infer<typeof MetaDataSchema>;
// This is stored in the RC5.yaml file
export type CourseAU = z.infer<typeof CourseAuSchema>;
// This is used by the visual editor and has content fields as well as
// build time props fields which hold onto course level settings
export type RuntimeCourseAu = z.infer<typeof RuntimeCourseAuSchema>;
export type CourseBlock = z.infer<typeof CourseBlockSchema>;
export type SlideType = z.infer<typeof SlideSchema>;
export type RuntimeSlideType = z.infer<typeof RunTimeSlideSchema>;
export type CourseData = z.infer<typeof CourseDataSchemaZod>;
export const CourseDataSchema = z.toJSONSchema(CourseDataSchemaZod);

export type RunTimeCourseData = z.infer<typeof RuntimeCourseDataSchemaZod>;
export const RunTimeCourseDataSchema = z.toJSONSchema(
  RuntimeCourseDataSchemaZod,
);
