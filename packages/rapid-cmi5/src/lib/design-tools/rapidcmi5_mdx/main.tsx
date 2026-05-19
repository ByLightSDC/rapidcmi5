import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import {
  RapidCmi5Opts,
  RapidCmi5OptsProvider,
} from '../course-builder/GitViewer/session/RapidCmi5OptsContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import { ElectronEventsBridge } from '../../electron/ElectronEventBridge';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';
import { Provider } from 'react-redux';
import { persistor, store } from '../../redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { FsAssetsContextProvider } from '../course-builder/GitViewer/session/CurrentLessonAssetsContext';

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RapidCmi5OptsProvider opts={rapidCmi5Opts}>
          <GitContextProvider>
            <FsAssetsContextProvider>
              <RC5ContextProvider>
                <ElectronEventsBridge />
                <RC5Modals />
                <Landing showHomeButton={rapidCmi5Opts.showHomeButton} />
              </RC5ContextProvider>
            </FsAssetsContextProvider>
          </GitContextProvider>
        </RapidCmi5OptsProvider>
      </PersistGate>
    </Provider>
  );
}
