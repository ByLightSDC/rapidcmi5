import { createContext } from 'react';
import { type LessonTheme } from '@rapid-cmi5/cmi5-build-common';

export interface ILessonThemeContext {
  lessonTheme?: LessonTheme;
}

/**
 * Provides the current lesson's LessonTheme to directive editor components
 * that are rendered inside the MDXEditor plugin tree.
 *
 * Wrap MDXEditor with LessonThemeContext.Provider in RC5VisualEditor.
 */
export const LessonThemeContext = createContext<ILessonThemeContext>({});
