import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import { RapidCmi5Opts, RapidCmi5OptsProvider } from '../course-builder/GitViewer/session/RapidCmi5OptsContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';
import { Provider } from 'react-redux';
import { persistor, store } from '../../redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RapidCmi5OptsProvider opts={rapidCmi5Opts}>
          <GitContextProvider>
            <RC5ContextProvider>
              <RC5Modals />
              <Landing showHomeButton={rapidCmi5Opts.showHomeButton} />
            </RC5ContextProvider>
          </GitContextProvider>
        </RapidCmi5OptsProvider>
      </PersistGate>
    </Provider>
  );
}
