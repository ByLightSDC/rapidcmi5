//REF import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './app';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

import AppUrlParams from './AppUrlParams';
import Auth from './Auth';
import { persistor, store } from './redux/store';

export default function AppWrapper() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <AppUrlParams />
      <Auth>
        <StrictMode>
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </PersistGate>
        </StrictMode>
      </Auth>
    </Provider>
  );
}
