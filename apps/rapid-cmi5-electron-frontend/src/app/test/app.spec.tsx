import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';

import { ThemeProvider } from '@mui/material';
import { lightTheme } from '../styles/muiTheme';

import App from '../app';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { bookmarksReducer, paginationReducer } from '@rangeos-nx/ui/branded';
import {
  commonAppReducer,
  commonAppTransReducer,
  commonIdReducer,
} from '@rangeos-nx/ui/redux';
import globalReducer from '../redux/globalReducer';
import { keycloakUiReducer } from '@rangeos-nx/ui/keycloak';

jest.mock('../shared/navbar/UserInfoBox', () => 'user-info-box');

// #region keycloak
const keycloak = Keycloak({
  url: 'https://intgtestweb.pdc.local:8000/auth/',
  realm: 'SLAMR',
  clientId: 'artemis_ui',
});

const onKeycloakEvent = (event: unknown, error: unknown) => {
  // console.log('onKeycloakEvent', event, error);
};

// this handles both the initial token and the automatic refreshes
const onKeycloakTokensUpdate = (tokens: any) => {
  // console.log('onKeycloakTokensUpdate', tokens);
};
// #endregion

describe('App', () => {
  it('should render successfully', () => {
    const mockStore = configureStore({
      reducer: {
        bookmarks: bookmarksReducer,
        keycloakUi: keycloakUiReducer,
        pagination: paginationReducer,
        global: globalReducer,
        commonApp: commonAppReducer,
        commonAppTrans: commonAppTransReducer,
        commonId: commonIdReducer,
      },
    });
    const queryClient = new QueryClient();

    const { baseElement } = render(
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <ReactKeycloakProvider
            authClient={keycloak}
            onEvent={onKeycloakEvent}
            onTokens={onKeycloakTokensUpdate}
          >
            <ThemeProvider theme={lightTheme}>
              <App />
            </ThemeProvider>
          </ReactKeycloakProvider>
        </QueryClientProvider>
      </Provider>,
    );

    expect(baseElement).toBeTruthy();
  });
});
