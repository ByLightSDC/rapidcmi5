import App from './app';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Auth from './Auth';

export default function AppWrapper() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <Auth >
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </StrictMode>
      </Auth>
    </Provider>
  );
}
