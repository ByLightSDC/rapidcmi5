import { AppDispatch } from '@rapid-cmi5/react-editor';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { resetPersistance, setIsLoggingOut } from '@rapid-cmi5/ui/branded';
/**
 * Hook resets persisted data and logs user out of keycloak
 */
export const useLogOut = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  /**
   * Handles logout
   * Return user to Welcome page
   * Set a logout state which triggers a modal to appear
   * Delay allows modal to display while clearing redux and persisted redux
   * After delay, log user out of keycloak
   */
  const handleLogOut = async () => {
    navigate('/'); //keycloak caches route, ensure it doesn't reroute to an old location user after re-login
    dispatch(setIsLoggingOut(true));
    dispatch(resetPersistance());
    await delay(2000);
  };

  return handleLogOut;
};
