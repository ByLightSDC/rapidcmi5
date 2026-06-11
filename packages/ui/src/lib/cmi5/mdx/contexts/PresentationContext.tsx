import { createContext, ReactNode, useMemo } from 'react';
import { Rc5Theme } from '@rapid-cmi5/cmi5-build-common';
import { ThemeMode } from '../../../redux/commonAppReducer';

export interface IPresentationContext {
  theme: Rc5Theme;
  themeMode: ThemeMode;
  logoPath: string | undefined;
}

/**
 * Provides the effective Theme (org values -> course values -> lesson values (highest precedence))
 * to directive editor components rendered inside the MDXEditor plugin tree.
 *
 * Consumers only see the merged `theme`. To change the base values, update
 * the `lessonTheme` / `courseTheme / `orgTheme`` props on the surrounding Provider;
 */
export const CoursePresentationContext = createContext<IPresentationContext>({
  theme: {},
  themeMode: 'light',
  logoPath: undefined,
});

/**
 * Shallow-merge an org-level theme with course- and lesson-level themes.
 * Lesson values win, then course; org values only fill in any remaining gaps.
 */
export function mergeThemes(
  orgTheme?: Rc5Theme,
  courseTheme?: Rc5Theme,
): Rc5Theme {
  return {
    ...(orgTheme ?? {}),
    ...(courseTheme ?? {}),
  };
}

export function CoursePresentationProvider({
  courseTheme,
  orgTheme,
  themeMode,
  children,
}: {
  courseTheme?: Rc5Theme;
  orgTheme?: Rc5Theme;
  themeMode: ThemeMode;
  children: ReactNode;
}) {
  const value = useMemo<IPresentationContext>(() => {
    const theme = mergeThemes(orgTheme, courseTheme);
    const logoPath =
      themeMode === 'dark'
        ? theme.logo?.dark?.relativePath
        : theme.logo?.light?.relativePath;
    return { theme, themeMode, logoPath };
  }, [courseTheme, orgTheme, themeMode]);

  return (
    <CoursePresentationContext.Provider value={value}>
      {children}
    </CoursePresentationContext.Provider>
  );
}
