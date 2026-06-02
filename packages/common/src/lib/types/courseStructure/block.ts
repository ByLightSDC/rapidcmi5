import z from 'zod/v4';
import { CourseAuSchema } from './au';

export const CourseBlockSchema = z.object({
  blockName: z.string(),
  blockDescription: z.string().optional(),
  aus: z.array(CourseAuSchema),
});

export type CourseBlock = z.infer<typeof CourseBlockSchema>;
