import {
  ContentWidthEnum,
  LessonTheme,
  OuterStyle,
} from '@rapid-cmi5/cmi5-build-common';
import {
  resolveBlockMaxWidth,
  resolveLessonThemeCSS,
} from '../styles/lessonThemeStyles';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { DIRECTIVE_INNER_BOX_SHADOW } from '../cmi5/mdx/constants/directiveLayout';
import { darken, lighten, SxProps, useTheme } from '@mui/material';

import { useGutterRight } from '../cmi5/mdx/plugins/shared/useGutterRight';

export const useLessonStyles = (
  lessonTheme: LessonTheme | undefined,
  overrideContentWidthStr?: ContentWidthEnum,
  maxWidth?: number, //FUTURE
  backgroundColor?: string,
) => {
  const muiTheme = useTheme();
  const [blockAppearanceOpen, setBlockAppearanceOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<
    ContentWidthEnum | undefined
  >(undefined);

  /* Lesson Theme */
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const lessonContentWidthSetting = resolvedThemeCSS?.maxWidth;

  /**
   * Determine inner content width
   */
  const blockMaxWidth = useMemo(() => {
    setContentWidth(overrideContentWidthStr);
    if (overrideContentWidthStr) {
      return resolveBlockMaxWidth(overrideContentWidthStr);
    }
    return lessonContentWidthSetting;
  }, [overrideContentWidthStr]);

  useEffect(() => {
    //not sure if this is needed
  }, [overrideContentWidthStr]);

  const { gutterRef, gutterRight } = useGutterRight(
    resolvedThemeCSS,
    blockMaxWidth,
  );

  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';

  // Inner box: fills all available width (lesson content width applies to text
  // inside via lesson theme CSS, not to this container). Page background color
  // creates the visual separation from the outer colored band.
  // When a block-level contentWidth is explicitly set, apply it here so the content
  // is narrowed while the outer color band still spans full width.

  const widthOverrideSx: SxProps = blockMaxWidth
    ? { maxWidth: blockMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : {};

  const innerSx: SxProps = {
    backgroundColor: muiTheme.palette.background.default,
    boxShadow: DIRECTIVE_INNER_BOX_SHADOW,
    ...widthOverrideSx,
    //TEMP backgroundColor: 'orange',
  };

  // Outer box: full-width background color band when backgroundColor is set.
  // paddingTop provides the colored space above the content (safe, layout-based).
  // clipPath 0 top avoids overdrawing elements above; negative bottom absorbs the
  // trailing <p>'s margin-top so the band fills flush to the next block.
  const outerSx: SxProps = {
    boxShadow: `0 0 0 100vmax ${backgroundColor}`,
    backgroundColor,
    clipPath: backgroundColor ? `inset(0 -100vmax 0)` : undefined,

    paddingTop: blockPadding,
    paddingBottom: blockPadding,
  };

  const outerStyle: OuterStyle = {
    'data-block-override': contentWidth !== undefined ? 'true' : {},
    style:
      contentWidth !== undefined
        ? ({ '--block-max-width': blockMaxWidth ?? 'none' } as CSSProperties)
        : {},
  };

  const borderColor = useMemo(() => {
    if (muiTheme.palette.mode === 'dark') {
      return lighten(muiTheme.palette.background.paper, 0.1);
    }
    return darken(muiTheme.palette.background.paper, 0.1);
  }, [muiTheme.palette.mode]);

  const innerActivitySx = {
    ...innerSx,
    boxShadow: 3,
    borderRadius: '7px',
    borderColor: borderColor,
    padding: 4,
    borderStyle: 'solid',
    borderWidth: '2px',
  };

  return {
    blockAppearanceOpen,
    blockPadding,
    borderColor,
    contentWidthDisplay: overrideContentWidthStr,
    innerSx,
    innerActivitySx,
    outerSx: outerSx,
    outerStyle: outerStyle,
    defaultBackgroundColor: muiTheme.palette.background.default,
    gutterRef,
    gutterRight,
    setBlockAppearanceOpen,
    setContentWidth,
  };
};
