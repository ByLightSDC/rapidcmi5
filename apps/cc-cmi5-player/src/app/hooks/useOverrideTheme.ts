import { lightTheme } from '../styles/muiTheme';
import { darkTheme } from '../styles/muiThemeDark';
import { CustomTheme } from '../styles/createPalette';
import { deepmerge } from '@mui/utils';
import { useSelector } from 'react-redux';
import { config, themeColor } from '@rapid-cmi5/ui';
import { useMemo } from 'react';
import { auConfigInitializedSel } from '../redux/auReducer';

/**
 * Hook that blends selected theme with overrides loaded from cfg file
 * @returns
 */
export const useOverrideTheme = () => {
  const themeSel = useSelector(themeColor);
  const isConfigInitialized = useSelector(auConfigInitializedSel);

  /**
   * update theme with overrides from cfg file
   */
  const currentTheme = useMemo(() => {
    const base = themeSel === 'dark' ? darkTheme : lightTheme;
    if (!isConfigInitialized) {
      return base;
    }

    const overrides: CustomTheme =
      themeSel === 'dark' ? config.THEME.DARK : config.THEME.LIGHT;
    const overriddenTheme = deepmerge(base, overrides);

    return overriddenTheme;
  }, [themeSel, isConfigInitialized]);

  /**
   * update theme with overrides from cfg file
   */
  const activityTheme = useMemo(() => {
    const base = darkTheme;
    if (!isConfigInitialized) {
      return base;
    }

    const overrides: CustomTheme = config.THEME.DARK;
    const overriddenTheme = deepmerge(base, overrides);
    return overriddenTheme;
  }, [isConfigInitialized]);

  return { currentTheme, activityTheme };
};
