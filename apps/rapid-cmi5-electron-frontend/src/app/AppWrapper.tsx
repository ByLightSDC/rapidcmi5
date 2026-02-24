import { QueryClient, QueryClientProvider } from 'react-query';
import App from './app';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

import AppUrlParams from './AppUrlParams';
import { persistor, store } from './redux/store';
import Auth from './contexts/AuthContext';
import UserConfig from './contexts/UserConfigContext';

export default function AppWrapper() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <AppUrlParams />
      <UserConfig>
        <Auth>
          <StrictMode>
            <PersistGate loading={null} persistor={persistor}>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </PersistGate>
          </StrictMode>
        </Auth>
      </UserConfig>
    </Provider>
  );
}
