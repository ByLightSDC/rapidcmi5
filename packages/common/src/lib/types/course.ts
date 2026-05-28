import { z } from 'zod/v4';
import { MoveOnCriteriaEnum } from './activity';

// --- Lesson Theme Defaults ---

export enum ContentWidthEnum {
  None = 'none',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum BlockPaddingEnum {
  None = 'none',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Custom = 'custom',
}

export enum DefaultAlignmentEnum {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export const contentWidthOptions = Object.values(ContentWidthEnum);
export const blockPaddingOptions = Object.values(BlockPaddingEnum);
export const defaultAlignmentOptions = Object.values(DefaultAlignmentEnum);

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

export enum CourseLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export const Cmi5ScenarioSchema = z.object({
  uuid: z.string().optional(),
  name: z.string().optional(),
  message: z.string().optional(),
  status: z.string().optional(),
});

export const SlideSchema = z.object({
  slideTitle: z.string(),
  type: z
    .enum([
      'markdown',
      'quiz',
      'ctf',
      'rangeosScenario',
      'sourceDoc',
      'codeRunner',
    ])
    .describe(
      'Slide type. Default to "markdown" unless the user asks for something else.',
    ),
  filepath: z
    .string()
    .describe(
      'Slide path relative to the course root, e.g. "introduction/slide-1.md".',
    ),
  content: z.string().optional().describe('Markdown body of the slide.'),
});

export const KSATElementSchema = z.object({
  element_identifier: z.string().optional(),
  element_type: z.enum(['task', 'knowledge', 'skill']).optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  doc_identifier: z.string().optional(),
});

export const LessonThemeSchema = z.object({
  contentWidth: z.enum(ContentWidthEnum).optional(),
  blockPadding: z.enum(BlockPaddingEnum).optional(),
  blockPaddingCustomValue: z.number().optional(),
  defaultAlignment: z.enum(DefaultAlignmentEnum).optional(),
  defaultActivityAlignment: z.enum(DefaultAlignmentEnum).optional(),
  lessonLogoLight: z.string().optional(),
  lessonLogoDark: z.string().optional(),
});

export const AuMetaDataSchema = z.object({
  buildTime: z.string().optional(),
  remoteGitUrl: z.string().optional(),
  gitBranch: z.string().optional(),
  rc5Version: z.string().optional(),
});

export const CourseSettings = z.object({
  courseTheme: LessonThemeSchema.optional(),
  metadata: AuMetaDataSchema.optional(),
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
  lessonTheme: LessonThemeSchema.optional(),
  // These values are only filled in at build time do to the constraint
  // that an au cannot look at the entire RC5.yaml file but only the config.json
  buildTimeProps: CourseSettings.optional(),
});

export const CourseBlockSchema = z.object({
  blockName: z.string(),
  blockDescription: z.string().optional(),
  aus: z.array(CourseAuSchema),
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
  buildTime: z.string().optional(),
  remoteGitUrl: z.string().optional(),
  gitBranch: z.string().optional(),
  rc5Version: z.string().optional(),
  courseTheme: LessonThemeSchema.optional(),
  blocks: z
    .array(CourseBlockSchema)
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

export type Cmi5Scenario = z.infer<typeof Cmi5ScenarioSchema>;
export type LessonTheme = z.infer<typeof LessonThemeSchema>;
export type AuMetaData = z.infer<typeof AuMetaDataSchema>;
export type CourseAU = z.infer<typeof CourseAuSchema>;
export type CourseBlock = z.infer<typeof CourseBlockSchema>;
export type SlideType = z.infer<typeof SlideSchema>;
export type CourseData = z.infer<typeof CourseDataSchemaZod>;
export const CourseDataSchema = z.toJSONSchema(CourseDataSchemaZod);
