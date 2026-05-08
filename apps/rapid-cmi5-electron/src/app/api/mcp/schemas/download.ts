// Mirrors DownloadFilesContent in packages/common/src/lib/types/download.ts.
import { z } from 'zod/v4';
import {
  KSATElementSchema,
  MoveOnCriteriaEnum,
} from '@rapid-cmi5/cmi5-build-common';

const DownloadFileDataSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.string(),
});

export const DownloadFilesContentSchema = z.object({
  // BaseActivity fields
  rc5id: z.string().optional(),
  ksats: z.array(KSATElementSchema).optional(),
  moveOnCriteria: z.enum(MoveOnCriteriaEnum).optional(),
  // DownloadFilesContent fields
  files: z.array(DownloadFileDataSchema),
});
