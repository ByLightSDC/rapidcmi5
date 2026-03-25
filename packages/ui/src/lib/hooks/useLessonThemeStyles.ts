import { SxProps } from '@mui/system';
import {
  DefaultAlignmentEnum,
  LessonTheme,
} from '@rapid-cmi5/cmi5-build-common';
import { resolveLessonThemeCSS } from '../styles/lessonThemeStyles';

export const useLessonThemeStyles = (
  lessonTheme: LessonTheme | undefined,
  maxWidth?: number | string,
) => {
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
  const outerActivitySxWithConstrainedWidth: SxProps = {
    backgroundColor: 'background.default',
    borderColor: 'divider',
    borderRadius: '12px',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: blockPadding,
    marginBottom: blockPadding,
    marginTop: blockPadding,
    maxWidth: maxWidth,
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
