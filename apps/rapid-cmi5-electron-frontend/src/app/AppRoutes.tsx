import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';


import rapidCmi5Routes from './views/dashboards/design-tools/rapidcmi5_mdx/routes';

/* Pages */

export default function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * useEffect corrects any double // in browser path
   *  which may occur if user manually updates the url
   */
  useEffect(() => {
    if (location.pathname.includes('//')) {
      const newPath = location.pathname.replaceAll('//', '/');
      navigate(newPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return rapidCmi5Routes;
}
