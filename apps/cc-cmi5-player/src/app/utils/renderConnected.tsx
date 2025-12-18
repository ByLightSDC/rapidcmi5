import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { commonAppReducer, FormCrudType } from '@rapid-cmi5/ui/redux';
import { ctfReducer } from '@rapid-cmi5/ui/branded';

import auReducer from '../redux/auReducer';

import navigationReducer from '../redux/navigationReducer';

import { keycloakUiReducer } from '@rapid-cmi5/ui/keycloak';

//REF future import { ThemeProvider } from '@mui/material';

/* eslint-disable @typescript-eslint/no-explicit-any */
type WrapperProps = {
  reducer?: any;
  preloadedState?: any | null;
  renderOptions?: any;
};

const defaultReducer = {
  au: auReducer,
  ctf: ctfReducer,
  navigation: navigationReducer,
  commonApp: commonAppReducer,
  keycloakUi: keycloakUiReducer,
};
const defaultState = {
  commonApp: {
    expanded: {},
    themeColor: 'light',
    isLoading: false,
    isNavOpen: true,
    navBarIndex: -1,
    currentFormCrudType: FormCrudType.view,
    message: { type: '', message: '' },
    modal: {
      type: '',
      id: null,
      name: null,
      meta: null,
      crudType: FormCrudType.view,
    },

    selection: [],
    multipleSelection: [],
  },
  keycloakUi: { authIdToken: '', authToken: '' },
};

const renderConnected = (
  ui: JSX.Element,
  {
    reducer = defaultReducer,
    preloadedState = defaultState,
    ...renderOptions
  }: WrapperProps,
) => {
  const Wrapper = ({ children }: any) => {
    const mockStore = configureStore({ reducer, preloadedState });

    return <Provider store={mockStore}>{children}</Provider>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export default renderConnected;
