import { SxProps } from '@mui/system';
import {
  DefaultAlignmentEnum,
  LessonTheme,
} from '@rapid-cmi5/cmi5-build-common';
import { resolveLessonThemeCSS } from '../styles/lessonThemeStyles';
import { useSelector } from 'react-redux';
import { useSignalEffect } from '@preact/signals-react';
import { maxSlideWidth$ } from '../cmi5/mdx';
import { useMemo, useState } from 'react';

export const useLessonThemeStyles = (
  lessonTheme: LessonTheme | undefined,
  maxWidth: number,
) => {
  // useMemo doesnt work with signals, mirror signal with state
  const [maxSlideWidth, setMaxSlideWidth] = useState<number | null>(null);

  //const slideWidth = useSelector(slideWi)
  /* Lesson Theme */
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);

  const activityAlign =
    lessonTheme?.defaultActivityAlignment || DefaultAlignmentEnum.Center;

  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS?.blockPadding
    ? resolvedThemeCSS?.blockPadding
    : '32px';

  /**
   * sx applied to outer div of activities with constrained width
   * CTF is an example of no constrained width, it should go full screen
   */
  const outerActivitySxWithConstrainedWidth: SxProps = useMemo(() => {
    return {
      backgroundColor: 'background.default',
      borderColor: 'divider',
      borderRadius: '12px',
      borderStyle: 'solid',
      borderWidth: '1px',
      padding: blockPadding,
      marginBottom: blockPadding,
      marginTop: blockPadding,
      maxWidth: maxSlideWidth ? Math.min(maxSlideWidth, maxWidth) : maxWidth,
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
    };
  }, [maxWidth, maxSlideWidth, activityAlign]);

  /**
   * we need to clear padding for views that use Form.tsx which applies an inner padding
   */
  const outerActivitySxWithConstrainedWidthForm: SxProps = {
    ...outerActivitySxWithConstrainedWidth,
    padding: 0,
  };

  /**
   * some activities make more sense full width
   */
  const outerActivitySxFullWidth: SxProps = {
    backgroundColor: 'background.default',
    borderRadius: '12px',
    padding: blockPadding,
    marginBottom: blockPadding,
    marginTop: blockPadding,
  };

  /**
   * Listen for slide width changed and update internal React state
   */
  useSignalEffect(() => {
    if (maxSlideWidth$.value) {
      setMaxSlideWidth(maxSlideWidth$.value);
    }
  });

  return {
    blockPadding,
    activityAlign: resolvedThemeCSS?.textAlign,
    outerActivitySxWithConstrainedWidth,
    outerActivitySxWithConstrainedWidthForm,
    outerActivitySxFullWidth,
  };
};

/**
 * max widths for forms and playback views
 */
export const maxFormWidths = {
  jobeEditor: 1024,
  quizEditor: 800,
  scenarioEditor: 800,
  downloadsEditor: 640,
  ctfPlayback: 1024,
  jobePlayback: 1024,
  quizPlayback: 800,
  scenarioPlayback: 1024,
};
