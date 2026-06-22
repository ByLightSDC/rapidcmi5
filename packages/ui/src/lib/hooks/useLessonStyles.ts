import {
  ContentWidthEnum,
  DefaultAlignmentEnum,
  Rc5Theme,
  OuterStyle,
} from '@rapid-cmi5/cmi5-build-common';
import {
  resolveBlockMaxWidth,
  resolveLessonThemeCSS,
} from '../styles/lessonThemeStyles';

import {
  CSSProperties,
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DIRECTIVE_INNER_BOX_SHADOW } from '../cmi5/mdx/constants/directiveLayout';
import { darken, lighten, SxProps, useTheme } from '@mui/material';

import { useGutterRight } from '../cmi5/mdx/plugins/shared/useGutterRight';
import { useSignalEffect } from '@preact/signals-react';
import { maxSlideWidth$ } from '../cmi5/mdx';
import { readOnly$, useCellValue } from '@mdxeditor/editor';

type UseLessonStylesReturn = {
  blockAppearanceOpen: boolean;
  blockPadding: string;
  borderColor: string;
  contentWidthDisplay: ContentWidthEnum | undefined;
  innerSx: SxProps;
  innerActivitySx: SxProps;
  outerSx: SxProps;
  outerStyle: OuterStyle;
  defaultBackgroundColor: string;
  gutterRef: RefObject<HTMLDivElement>;
  gutterRight: string;
  setBlockAppearanceOpen: Dispatch<SetStateAction<boolean>>;
  setContentWidth: Dispatch<SetStateAction<ContentWidthEnum | undefined>>;
};

export const useLessonStyles = (
  lessonTheme: Rc5Theme | undefined,
  overrideContentWidthStr?: ContentWidthEnum,
  maxWidth?: number, //FUTURE
  bgColor?: string,
  activityBackgroundColor?: string,
  isPlayback?: boolean,
  isReadonly?: boolean,
): UseLessonStylesReturn => {
  const muiTheme: any = useTheme();
  const activityAlign =
    lessonTheme?.defaultActivityAlignment || DefaultAlignmentEnum.Center;
  const [blockAppearanceOpen, setBlockAppearanceOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<
    ContentWidthEnum | undefined
  >(undefined);
  // useMemo doesnt work with signals, mirror signal with state
  const [maxSlideWidth, setMaxSlideWidth] = useState<number | null>(null);
  const isReadOnly = useCellValue(readOnly$);
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
  }, [overrideContentWidthStr, lessonContentWidthSetting]);

  const { gutterRef, gutterRight } = useGutterRight(
    resolvedThemeCSS,
    blockMaxWidth,
  );

  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';

  const halfBlockPadding = parseInt(blockPadding, 10) / 2.0;

  // Inner box: fills all available width (lesson content width applies to text
  // inside via lesson theme CSS, not to this container). Page background color
  // creates the visual separation from the outer colored band.
  // When a block-level contentWidth is explicitly set, apply it here so the content
  // is narrowed while the outer color band still spans full width.

  const widthOverrideSx: SxProps = blockMaxWidth
    ? {
        maxWidth: blockMaxWidth,
        marginLeft:
          activityAlign === DefaultAlignmentEnum.Center
            ? 'auto'
            : activityAlign === DefaultAlignmentEnum.Left
              ? 0
              : 'auto',
        marginRight:
          activityAlign === DefaultAlignmentEnum.Center
            ? 'auto'
            : activityAlign === DefaultAlignmentEnum.Right
              ? 0
              : 'auto',
      }
    : {};

  const innerSx: SxProps = {
    backgroundColor: muiTheme.palette.background.default,
    boxShadow: DIRECTIVE_INNER_BOX_SHADOW,
    ...widthOverrideSx,
  };

  // Outer box: full-width background color band when backgroundColor is set.
  // paddingTop provides the colored space above the content (safe, layout-based).
  // clipPath 0 top avoids overdrawing elements above; negative bottom absorbs the
  // trailing <p>'s margin-top so the band fills flush to the next block.
  const outerSx: SxProps = {
    boxShadow: `0 0 0 100vmax ${bgColor}`,
    bgColor,
    clipPath: bgColor ? `inset(0 -100vmax 0)` : undefined,
    paddingTop: halfBlockPadding,
    paddingBottom: halfBlockPadding,
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
  }, [muiTheme.palette.mode, muiTheme.palette.background.paper]);

  const innerActivitySx = useMemo(() => {
    return {
      ...innerSx,
      boxShadow: 3,
      borderRadius: '10px',
      borderColor: borderColor,
      padding: 4,
      borderStyle: 'solid',
      borderWidth: '2px',
      backgroundColor:
        isPlayback || isReadOnly
          ? activityBackgroundColor
          : 'background.default',
    };
  }, [borderColor, innerSx, isPlayback, isReadOnly, activityBackgroundColor]);

  useEffect(() => {
    //not sure if this is needed
  }, [overrideContentWidthStr]);

  /**
   * Listen for slide width changed and update internal React state
   */
  useSignalEffect(() => {
    if (maxSlideWidth$.value) {
      setMaxSlideWidth(maxSlideWidth$.value);
    }
  });

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
