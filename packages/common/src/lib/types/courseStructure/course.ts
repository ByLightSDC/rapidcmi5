import { z } from 'zod/v4';
import { CourseBlockSchema } from './block';

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
// This is stored in the RC5.yaml file

export type CourseData = z.infer<typeof CourseDataSchemaZod>;
export const CourseDataSchema = z.toJSONSchema(CourseDataSchemaZod);
