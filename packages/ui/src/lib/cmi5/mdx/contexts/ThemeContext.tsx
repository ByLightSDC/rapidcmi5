import { createContext, ReactNode, useMemo, useState } from 'react';
import { Theme } from '@rapid-cmi5/cmi5-build-common';

export interface IThemeContext {
  /**
   * Effective theme: course values overlaid by lesson values, then by any
   * logo overrides set via `setLogoOverrides`.
   */
  theme: Theme;
}

/**
 * Provides the effective Theme (course values overlaid by lesson values)
 * to directive editor components rendered inside the MDXEditor plugin tree.
 *
 * Consumers only see the merged `theme`. To change the base values, update
 * the `lessonTheme` / `courseTheme` props on the surrounding Provider; to
 * override logos at runtime, call `setLogoOverrides`.
 */
export const CoursePresentationContext = createContext<IThemeContext>({
  theme: {},
});

/**
 * Shallow-merge an LMS-level theme with course- and lesson-level themes.
 * Lesson values win, then course; LMS values only fill in any remaining gaps.
 */
export function mergeThemes(
  lmsTheme?: Theme,
  courseTheme?: Theme,
  lessonTheme?: Theme,
): Theme {
  return {
    ...(lmsTheme ?? {}),
    ...(courseTheme ?? {}),
    ...(lessonTheme ?? {}),
  };
}

export function CoursePresentationProvider({
  lessonTheme,
  courseTheme,
  lmsTheme,
  children,
}: {
  lessonTheme?: Theme;
  courseTheme?: Theme;
  lmsTheme?: Theme;
  children: ReactNode;
}) {
  console.log('Recieved themes', lessonTheme, courseTheme, lmsTheme);
  const value = useMemo<IThemeContext>(
    () => ({
      theme: { ...mergeThemes(lmsTheme, courseTheme, lessonTheme) },
    }),
    [lessonTheme, courseTheme, lmsTheme],
  );

  return (
    <CoursePresentationContext.Provider value={value}>
      {children}
    </CoursePresentationContext.Provider>
  );
}
