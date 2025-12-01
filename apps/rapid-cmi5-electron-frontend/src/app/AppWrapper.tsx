//REF import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './app';
import { Provider } from 'react-redux';
import { store } from '@rangeos-nx/rapid-cmi5';
import { persistor } from '@rangeos-nx/rapid-cmi5';
import { StrictMode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

import AppUrlParams from './AppUrlParams';

export default function AppWrapper() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <AppUrlParams />
      <StrictMode>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </PersistGate>
      </StrictMode>
    </Provider>
  );
}
