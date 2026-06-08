import React, { createContext } from 'react';
import { Theme } from '@rapid-cmi5/cmi5-build-common';

export interface ILessonThemeContext {
  lessonTheme?: Theme;
}

/**
 * Provides the current lesson's Theme to directive editor components
 * that are rendered inside the MDXEditor plugin tree.
 *
 * Wrap MDXEditor with LessonThemeContext.Provider in RC5VisualEditor.
 */
export const LessonThemeContext = createContext<ILessonThemeContext>({});
