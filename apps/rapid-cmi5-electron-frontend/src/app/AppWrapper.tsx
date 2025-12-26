//REF import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './app';
import { Provider } from 'react-redux';
import { PropsWithChildren, StrictMode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

import AppUrlParams from './AppUrlParams';
import Auth from './Auth';
import { persistor, store } from './redux/store';
import { config } from '@rapid-cmi5/ui';

export default function AppWrapper() {
  const queryClient = new QueryClient();
  const authEnabled = config.KEYCLOAK_URL != undefined;
  function AuthGate({ children }: PropsWithChildren) {
    return authEnabled ? <Auth>{children}</Auth> : <>{children}</>;
  }

  return (
    <Provider store={store}>
      <AppUrlParams />
      <StrictMode>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <AuthGate>
              <App authEnabled={authEnabled}/>
            </AuthGate>
          </QueryClientProvider>
        </PersistGate>
      </StrictMode>
    </Provider>
  );
}
