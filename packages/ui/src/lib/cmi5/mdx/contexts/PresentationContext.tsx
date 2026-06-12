import { createContext, ReactNode, useContext, useMemo } from 'react';
import { deepmerge } from '@mui/utils';
import { Rc5Theme } from '@rapid-cmi5/cmi5-build-common';
import { ThemeMode } from '../../../redux/commonAppReducer';
import { Theme, ThemeProvider } from '@mui/material';

export interface IPresentationContext {
  rc5Theme: Rc5Theme;
  logoPath: string | undefined;
  currentTheme: any;
  activityTheme: any;
}

export function useCoursePresentation() {
  const ctx = useContext(CoursePresentationContext);
  if (!ctx)
    throw new Error(
      'useCoursePresentation must be used within CoursePresentationProvider',
    );
  return ctx;
}

/**
 * Provides the effective Theme (org values -> course values (highest precedence))
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

export function mergeThemes(
  orgTheme?: Rc5Theme,
  courseTheme?: Rc5Theme,
): Rc5Theme {
  return deepmerge(orgTheme ?? {}, courseTheme ?? {});
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
  baseLightTheme: Theme;
  baseDarkTheme: Theme;
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
    // TODO
    // I dont believe this is correct but am keeping it here for now
    // as this is how I found it
    const activityTheme = deepmerge(baseDarkTheme, rc5Theme.dark);

    return {
      rc5Theme,
      logoPath,
      currentTheme,
      activityTheme,
    };
  }, [courseTheme, orgTheme, themeMode, baseLightTheme, baseDarkTheme]);

  /**
   * There is a special MUI Theme Provider to deal with the elements within
   * the domain of the object. This allows us to have special MUI themes for the
   * MDX editor portion and different themese for the main rapid cmi5 application
   */
  return (
    <CoursePresentationContext.Provider value={value}>
      <ThemeProvider theme={value.currentTheme}>{children}</ThemeProvider>
    </CoursePresentationContext.Provider>
  );
}
