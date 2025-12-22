import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * Redirects route to input route
 * @param {string} path Path to navigate to
 */
export function RedirectRoute({ path }: { path: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
export default RedirectRoute;
