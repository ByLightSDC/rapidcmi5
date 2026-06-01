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
import { ApiProviders } from '@rapid-cmi5/ui';
import { detectIsElectron } from '../course-builder/GitViewer/utils/gitFsInstance';

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  const isElectron = detectIsElectron();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RapidCmi5OptsProvider opts={rapidCmi5Opts}>
          <ApiProviders
            token={rapidCmi5Opts.userAuth?.token}
            rangeUrl={rapidCmi5Opts.apiUrls?.rangeUrl}
            codeRunnerUrl={rapidCmi5Opts.apiUrls?.codeRunnerUrl}
            quizBankUrl={rapidCmi5Opts.apiUrls?.quizBankUrl}
            isElectron={isElectron}
          >
            <GitContextProvider>
              <RC5ContextProvider>
                <ElectronEventsBridge />
                <RC5Modals />
                <Landing />
              </RC5ContextProvider>
            </GitContextProvider>
          </ApiProviders>
        </RapidCmi5OptsProvider>
      </PersistGate>
    </Provider>
  );
}
