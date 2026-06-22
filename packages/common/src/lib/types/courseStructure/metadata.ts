import z from 'zod/v4';
import { ThemeSchema } from '../ui';

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

export type MetaData = z.infer<typeof MetaDataSchema>;
