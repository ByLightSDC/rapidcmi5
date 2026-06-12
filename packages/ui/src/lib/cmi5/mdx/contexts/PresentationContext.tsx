import { createContext, ReactNode, useMemo } from 'react';
import { deepmerge } from '@mui/utils';
import { Rc5Theme } from '@rapid-cmi5/cmi5-build-common';
import { ThemeMode } from '../../../redux/commonAppReducer';

export interface IPresentationContext {
  rc5Theme: Rc5Theme;
  logoPath: string | undefined;
  currentTheme: any;
  activityTheme: any;
}

/**
 * Provides the effective Theme (org values -> course values -> lesson values (highest precedence))
 * to directive editor components rendered inside the MDXEditor plugin tree.
 *
 * Consumers see the merged `rc5Theme` plus `currentTheme` / `activityTheme`
 * (the base MUI themes blended with overrides). `orgTheme` and `courseTheme`
 * are controlled props driven by the caller's source of truth.
 */
export const CoursePresentationContext = createContext<IPresentationContext>({
  rc5Theme: {},
  logoPath: undefined,
  currentTheme: undefined,
  activityTheme: undefined,
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
  themeMode,
  baseLightTheme,
  baseDarkTheme,
  orgTheme,
  courseTheme,
  children,
}: {
  themeMode: ThemeMode;
  baseLightTheme: any;
  baseDarkTheme: any;
  orgTheme?: Rc5Theme;
  courseTheme?: Rc5Theme;
  children: ReactNode;
}) {
  const value = useMemo<IPresentationContext>(() => {
    // This is the computed version with course overriding org level settings
    const rc5Theme = mergeThemes(orgTheme, courseTheme);
    const logoPath =
      themeMode === 'dark'
        ? rc5Theme.logo?.dark?.relativePath
        : rc5Theme.logo?.light?.relativePath;

    const base = themeMode === 'dark' ? baseDarkTheme : baseLightTheme;
    const overrides = themeMode === 'dark' ? rc5Theme.dark : rc5Theme.light;
    const currentTheme = deepmerge(base, overrides);
    const activityTheme = deepmerge(baseDarkTheme, rc5Theme.dark);

    return {
      rc5Theme,
      logoPath,
      currentTheme,
      activityTheme,
    };
  }, [courseTheme, orgTheme, themeMode, baseLightTheme, baseDarkTheme]);

  return (
    <CoursePresentationContext.Provider value={value}>
      {children}
    </CoursePresentationContext.Provider>
  );
}
