import { BrowserRouter as RouterWrapper } from 'react-router';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { brandedTheme } from '../styles/muiTheme';
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { NotificationsProvider } from '@toolpad/core';
//import globalReducer from '../redux/globalReducer';
//import packageReducer from '../redux/packageReducer';
import {
  commonAppReducer,
  commonIdReducer,
  dynamicSchemaReducer,
} from '@rangeos-nx/ui/redux';
import {
  BookmarksContextProvider,
  FormControlUIProvider,
  FormCrudType,
  bookmarksReducer,
  paginationReducer,
} from '@rangeos-nx/ui/branded';
// import deployRangeContentReducer from '../redux/deployRangeContentReducer';
// import { featureFlagBookmarks } from './featureFlags';
// import projectReducer, {
//   defaultUserPreferences,
// } from '../redux/projectReducer';

type WrapperProps = {
  reducer?: any;
  preloadedState?: any | null;
  renderOptions?: any;
};

const defaultReducer = {
  //bookmarks: bookmarksReducer,
  commonApp: commonAppReducer,
  // commonId: commonIdReducer,
  // global: globalReducer,
  // pagination: paginationReducer,
  // deployRangeContent: deployRangeContentReducer,
  // package: packageReducer,
  // project: projectReducer,
  // schemaData: dynamicSchemaReducer,
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
  // commonId: {
  //   commonIds: [], //lookup table to retrieve meta data based on uuid
  // },
  // pagination: { currentPage: 0 },
  // bookmarks: {
  //   cue: [],
  //   hasModal: false,
  //   shouldShowBookmarks: true,
  // },
  // deployRangeContent: {
  //   rangeId: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
  //   rangeName: 'Mock Range 1',
  //   scenarioId: null,
  //   scenarioName: null,
  //   consoleUrl: null,
  // },
  // package: {
  //   menu: {
  //     Certificates: { touched: false, count: 0 },
  //     Consoles: { touched: false, count: 0 },
  //     Containers: { touched: false, count: 0 },
  //     'DNS Servers': { touched: false, count: 0 },
  //     'DNS Zones': { touched: false, count: 0 },
  //     'DNS Records': { touched: false, count: 0 },
  //     IPs: { touched: false, count: 0 },
  //     Networks: { touched: false, count: 0 },
  //     Routers: { touched: false, count: 0 },
  //     VMs: { touched: false, count: 0 },
  //     Volumes: { touched: false, count: 0 },
  //   },
  // },
  // project: { user_preferences: defaultUserPreferences },
  // schemaData: {
  //   fieldAttributes: {},
  //   isValidated: false,
  // },
};

export const renderBrandedConnected = (
  ui: JSX.Element,
  {
    reducer = defaultReducer,
    preloadedState = defaultState,
    ...renderOptions
  }: WrapperProps,
) => {
  const Wrapper = ({ children }: any) => {
    const mockStore = configureStore({ reducer, preloadedState });
    const queryClient = new QueryClient();

    return (
      <ThemeProvider theme={brandedTheme}>
        <Provider store={mockStore}>
          <RouterWrapper>
            {/* <BookmarksContextProvider disabled={false}> */}
            <QueryClientProvider client={queryClient}>
              <NotificationsProvider
                slotProps={{
                  snackbar: {
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                  },
                }}
              >
                <FormControlUIProvider>{children}</FormControlUIProvider>
              </NotificationsProvider>
            </QueryClientProvider>
            {/* </BookmarksContextProvider> */}
          </RouterWrapper>
        </Provider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
