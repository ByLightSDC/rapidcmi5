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
 * Shallow-merge an org-level theme with course- and lesson-level themes.
 * Lesson values win, then course; org values only fill in any remaining gaps.
 */
export function mergeThemes(
  orgTheme?: Theme,
  courseTheme?: Theme,
  lessonTheme?: Theme,
): Theme {
  return {
    ...(orgTheme ?? {}),
    ...(courseTheme ?? {}),
    ...(lessonTheme ?? {}),
  };
}

export function CoursePresentationProvider({
  lessonTheme,
  courseTheme,
  orgTheme,
  children,
}: {
  lessonTheme?: Theme;
  courseTheme?: Theme;
  orgTheme?: Theme;
  children: ReactNode;
}) {
  console.log('Recieved themes', lessonTheme, courseTheme, orgTheme);
  const value = useMemo<IThemeContext>(
    () => ({
      theme: { ...mergeThemes(orgTheme, courseTheme, lessonTheme) },
    }),
    [lessonTheme, courseTheme, orgTheme],
  );

  return (
    <CoursePresentationContext.Provider value={value}>
      {children}
    </CoursePresentationContext.Provider>
  );
}
