/*
Stores navigation information in redux
Selected objects, an alias that can be used to change the appearance of breadcrumbs
If the navigation is intended for displaying a form, crudType records which crud action user initiated
Navigates to path after storing information
 */
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { setCurrentFormCrudType } from '../redux/commonAppReducer';
import { FormCrudType } from '../redux/utils/types';

export const useNavigateAlias = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const navigateTo = (
    path: string,
    uuid: string | undefined,
    alias: string | undefined,
    crudType?: FormCrudType | undefined,
    meta?: any,
    shouldOverride = true,
  ) => {
    // if (uuid && alias) {
    //   dispatch(
    //     setCommonId({
    //       id: uuid,
    //       name: alias,
    //       crudType: crudType || FormCrudType.view,
    //       meta: meta,
    //       shouldOverride: shouldOverride,
    //     }),
    //   );
    // }
    if (crudType) {
      dispatch(setCurrentFormCrudType(crudType));
    }
    if (path) {
      navigate(path);
    }
  };

  return navigateTo;
};
