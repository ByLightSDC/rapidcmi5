// --- Lesson Theme Defaults ---

import { z } from 'zod/v4';
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

const logoSchema = z.object({
  relativePath: z.string().optional(),
});

export const ThemeSchema = z.object({
  contentWidth: z.enum(ContentWidthEnum).optional().catch(undefined),
  blockPadding: z.enum(BlockPaddingEnum).optional().catch(undefined),
  blockPaddingCustomValue: z.number().optional().catch(undefined),
  defaultAlignment: z.enum(DefaultAlignmentEnum).optional().catch(undefined),
  defaultActivityAlignment: z
    .enum(DefaultAlignmentEnum)
    .optional()
    .catch(undefined),
  logo: z
    .object({
      light: logoSchema,
      dark: logoSchema,
    })
    .optional(),
  faviconUrl: z.string().optional(),
  playerTitle: z.string().optional(),
  // mui themes, we need to fix some of our packages to get this to work with
  // the correct types
  light: z.any().optional(),
  dark: z.any().optional(),
});

export type Rc5Theme = z.infer<typeof ThemeSchema>;
