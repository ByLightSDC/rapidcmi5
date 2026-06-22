// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import z from 'zod/v4';

export const defaultSlideContent = '# Slide'; //TODO focus issues if you try to paste blank

export const SlideSchema = z.object({
  slideTitle: z.string(),
  filepath: z
    .string()
    .describe(
      'Slide path relative to the course root, e.g. "introduction/slide-1.md".',
    ),
  content: z.string().optional().describe('Markdown body of the slide.'),
});

export type SlideType = z.infer<typeof SlideSchema>;
