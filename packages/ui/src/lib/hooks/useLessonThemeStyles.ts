import { SxProps } from '@mui/system';
import { LessonTheme } from '@rapid-cmi5/cmi5-build-common';
import { resolveLessonThemeCSS } from '../styles/lessonThemeStyles';

export const useLessonThemeStyles = (lessonTheme: LessonTheme | undefined) => {
  /* Lesson Theme */
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);

  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS?.blockPadding ? '0px' : '32px';

  return { blockPadding, activityAlign: resolvedThemeCSS?.textAlign };
};
