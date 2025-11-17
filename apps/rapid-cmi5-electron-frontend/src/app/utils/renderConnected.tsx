import { BrowserRouter as RouterWrapper } from 'react-router';
import { render } from '@testing-library/react';

import { lightTheme } from '../styles/muiTheme';
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureStore } from '@reduxjs/toolkit';
import { NotificationsProvider } from '@toolpad/core';
import { Provider } from 'react-redux';
import globalReducer from '../redux/globalReducer';
import {
  commonAppReducer,
  commonIdReducer,
  dynamicSchemaReducer,
} from '@rangeos-nx/ui/redux';
import {
  BookmarksContextProvider,
  FormControlUIProvider,
  FormCrudType,
  TimePickerProvider,
  bookmarksReducer,
  paginationReducer,
} from '@rangeos-nx/ui/branded';
import { featureFlagBookmarks } from './featureFlags';

import { ThemeProvider } from '@mui/material';
// for using mui time picker library
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/* eslint-disable @typescript-eslint/no-explicit-any */
type WrapperProps = {
  reducer?: any;
  preloadedState?: any | null;
  renderOptions?: any;
};

const defaultReducer = {
  bookmarks: bookmarksReducer,
  commonApp: commonAppReducer,
  commonId: commonIdReducer,
  global: globalReducer,
  pagination: paginationReducer,
  schemaData: dynamicSchemaReducer,
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
  commonId: {
    commonIds: [], //lookup table to retrieve meta data based on uuid
  },
  pagination: { currentPage: 0 },
  bookmarks: {
    cue: [],
    hasModal: false,
    shouldShowBookmarks: true,
  },
  deployRangeContent: {
    rangeName: 'Mock Range 1',
    scenarioName: null,
    consoleUrl: null,
  },
  package: {
    menu: {
      Certificates: { touched: false, count: 0 },
      Consoles: { touched: false, count: 0 },
      Containers: { touched: false, count: 0 },
      'DNS Servers': { touched: false, count: 0 },
      'DNS Zones': { touched: false, count: 0 },
      'DNS Records': { touched: false, count: 0 },
      IPs: { touched: false, count: 0 },
      Networks: { touched: false, count: 0 },
      Routers: { touched: false, count: 0 },
      VMs: { touched: false, count: 0 },
      Volumes: { touched: false, count: 0 },
    },
  },
  schemaData: {
    fieldAttributes: {},
    isValidated: false,
  },
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
    const queryClient = new QueryClient();

    return (
      <ThemeProvider theme={lightTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Provider store={mockStore}>
            <RouterWrapper>
              <TimePickerProvider>
                <BookmarksContextProvider disabled={!featureFlagBookmarks}>
                  <QueryClientProvider client={queryClient}>
                    <NotificationsProvider
                      slotProps={{
                        snackbar: {
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                        },
                      }}
                    >
                      <FormControlUIProvider>{children}</FormControlUIProvider>
                    </NotificationsProvider>
                  </QueryClientProvider>
                </BookmarksContextProvider>
              </TimePickerProvider>
            </RouterWrapper>
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export default renderConnected;
