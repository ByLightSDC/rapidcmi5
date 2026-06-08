import z from 'zod/v4';
import { BaseActivitySchema } from './baseActivity';

export const DownloadFileDataSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.string(),
});

export const DownloadFilesContentSchema = BaseActivitySchema.extend({
  files: z.array(DownloadFileDataSchema),
});

export type DownloadFileData = z.infer<typeof DownloadFileDataSchema>;
export type DownloadFilesContent = z.infer<typeof DownloadFilesContentSchema>;
