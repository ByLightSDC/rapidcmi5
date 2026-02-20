import {
  BlockPaddingEnum,
  ContentWidthEnum,
  DefaultAlignmentEnum,
  LessonTheme,
} from '../../../../common/src/lib/types/course';

export const CONTENT_WIDTH_MAP: Record<ContentWidthEnum, string | null> = {
  [ContentWidthEnum.None]: null,
  [ContentWidthEnum.Small]: '55%',
  [ContentWidthEnum.Medium]: '75%',
  [ContentWidthEnum.Large]: '100%',
};

export const BLOCK_PADDING_MAP: Record<string, string | null> = {
  [BlockPaddingEnum.None]: null,
  [BlockPaddingEnum.Small]: '8px',
  [BlockPaddingEnum.Medium]: '32px',
  [BlockPaddingEnum.Large]: '64px',
};

export const ALIGNMENT_MAP: Record<DefaultAlignmentEnum, { textAlign: string; justifyContent: string }> = {
  [DefaultAlignmentEnum.Left]: {
    textAlign: 'start',
    justifyContent: 'flex-start',
  },
  [DefaultAlignmentEnum.Center]: {
    textAlign: 'center',
    justifyContent: 'center',
  },
  [DefaultAlignmentEnum.Right]: {
    textAlign: 'end',
    justifyContent: 'flex-end',
  },
};

export const DEFAULT_LESSON_THEME = {
  contentWidth: ContentWidthEnum.None,
  blockPadding: BlockPaddingEnum.None,
  defaultAlignment: DefaultAlignmentEnum.Left,
};

/**
 * Resolves a LessonTheme to concrete CSS values.
 * Returns null if no theme is set (avoids unnecessary style injection).
 */
export function resolveLessonThemeCSS(theme?: LessonTheme): {
  maxWidth: string | null;
  blockPadding: string | null;
  textAlign: string;
  justifyContent: string;
} | null {
  if (!theme) return null;

  const width = theme.contentWidth || DEFAULT_LESSON_THEME.contentWidth;
  const padding = theme.blockPadding || DEFAULT_LESSON_THEME.blockPadding;
  const alignment = theme.defaultAlignment || DEFAULT_LESSON_THEME.defaultAlignment;

  const resolvedPadding =
    padding === BlockPaddingEnum.Custom
      ? `${theme.blockPaddingCustomValue ?? 16}px`
      : BLOCK_PADDING_MAP[padding] ?? null;

  return {
    maxWidth: CONTENT_WIDTH_MAP[width] ?? null,
    blockPadding: resolvedPadding,
    ...ALIGNMENT_MAP[alignment],
  };
}

/**
 * Generates a scoped CSS string that applies lesson theme defaults
 * to the MDX editor content area.
 *
 * - Content width: sets max-width and centers the content area
 * - Block padding: adds vertical spacing between top-level block elements
 * - Alignment: sets text-align on top-level block elements
 *
 * Uses direct child combinator (>) so per-component alignment overrides
 * (Grid, Accordion, Tabs) naturally take precedence.
 */
export function generateLessonThemeStyleTag(scopedClass: string, theme?: LessonTheme): string {
  const css = resolveLessonThemeCSS(theme);
  if (!css) return '';

  const widthRule = css.maxWidth ? `
    .${scopedClass} .mdxeditor-root-contenteditable {
      max-width: ${css.maxWidth};
      margin-left: auto;
      margin-right: auto;
    }` : '';

  const alignmentRule = `
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > p,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-paragraph="true"],
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > ul,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > ol,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > blockquote,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h1,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h2,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h3,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h4,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h5,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h6 {
      text-align: ${css.textAlign};
    }`;

  const blockPaddingRule = css.blockPadding ? `
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator] + [data-lexical-decorator],
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator] + p,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > p + [data-lexical-decorator] {
      margin-top: ${css.blockPadding};
    }` : '';

  return widthRule + alignmentRule + blockPaddingRule;
}
