import {
  BlockPaddingEnum,
  ContentWidthEnum,
  DefaultAlignmentEnum,
  LessonTheme,
} from '@rapid-cmi5/cmi5-build-common';

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

export const ALIGNMENT_MAP: Record<
  DefaultAlignmentEnum,
  { textAlign: string; justifyContent: string }
> = {
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
  defaultActivityAlignment: DefaultAlignmentEnum.Center,
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
  const alignment =
    theme.defaultAlignment || DEFAULT_LESSON_THEME.defaultAlignment;

  const resolvedPadding =
    padding === BlockPaddingEnum.Custom
      ? `${theme.blockPaddingCustomValue ?? 16}px`
      : (BLOCK_PADDING_MAP[padding] ?? null);

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
export function generateLessonThemeStyleTag(
  scopedClass: string,
  theme?: LessonTheme,
): string {
  const css = resolveLessonThemeCSS(theme);

  //console.log('css.maxWidth', css?.maxWidth);
  //max-width: 100vw;

  // Always emit --content-margin so directive calc() expressions resolve even when no theme is set.
  if (!css) return `.${scopedClass} { --content-margin: 0px; }`;

  const widthRule = css.maxWidth
    ? `
  .${scopedClass} {
    --content-margin: calc((100% - ${css.maxWidth}) / 2);
  }
  .${scopedClass} .mdxeditor-root-contenteditable {
    max-width: ${css.maxWidth};
    margin-left: auto;
    margin-right: auto;
    overflow: visible;
  }
  .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator]:not(:has(.paper-activity)) {
    max-width: ${css.maxWidth};
    margin-left: auto;
    margin-right: auto;
  }
  .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator]:has(.paper-activity) {
    width: calc(100vw - var(--panel-width));
    max-width: calc(100vw - var(--panel-width));
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    overflow: visible;
  }
  .${scopedClass} .mdxeditor-root-contenteditable [data-lexical-editor="true"] [data-lexical-decorator]:not(:has(.paper-activity)) {
    max-width: none;
    margin-left: unset;
    margin-right: unset;
  }`
    : `
  .${scopedClass} {
    --content-margin: 0px;
  }`;

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
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > h6,
      text-align: ${css.textAlign};
    }`;

  // Zero margin-top on colored decorators (they carry data-bgcolor on their inner Box)
  // so the full-width band starts flush — no gap above the color. The band's own
  // paddingTop provides the internal top spacing.
  // Also zero empty <p> nodes flanking decorators so they don't add phantom whitespace.
  const blockBaseRule = `
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator]:has([data-bgcolor]) {
      margin-top: 0;
    }
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator] + p:empty,
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > p:empty:has(+ [data-lexical-decorator]) {
      margin-top: 0;
      margin-bottom: 0;
    }
`;

  const blockPaddingRule = css.blockPadding
    ? `
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > [data-lexical-decorator]:not(:first-child),
    .${scopedClass} .mdxeditor-root-contenteditable > div > div > p:not(:first-child) {
      margin-top: ${css.blockPadding};
    }`
    : '';

  return alignmentRule + widthRule + blockPaddingRule + blockBaseRule;
}
