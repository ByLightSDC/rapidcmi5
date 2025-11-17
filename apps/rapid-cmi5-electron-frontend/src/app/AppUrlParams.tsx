import {
  setAppHeaderVisible,
  setBreadCrumbVisible,
  setTheme,
} from '@rangeos-nx/ui/redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function AppUrlParams() {
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(window.location.search);

  const checkParams = () => {
    //to force a theme
    const themeParam = searchParams.get('theme') || '';
    if (themeParam) {
      dispatch(setTheme(themeParam));
    }
    const navDisabled = searchParams.get('nav_disabled') || '';
    if (navDisabled) {
      dispatch(setAppHeaderVisible(false));
      dispatch(setBreadCrumbVisible(false));
    }
  };

  /**
   * UE loads plugins file from assets folder
   */
  useEffect(() => {
    checkParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div />;
}
