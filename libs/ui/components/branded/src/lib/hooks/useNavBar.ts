import { useDispatch, useSelector } from 'react-redux';
import { useEffectOnce } from './useEffectOnce';
import { navBarIndex, setNavbarIndex } from '@rapid-cmi5/ui/redux';

// React18 StrictMode introduced useEffect running twice in development mode
// Use this hook as a work around
export const useNavBar = (navIndex: number) => {
  //Hooks
  const dispatch = useDispatch();
  const navBarIndexSel = useSelector(navBarIndex);

  useEffectOnce(() => {
    dispatch(setNavbarIndex(navIndex));
  }, []);
};
