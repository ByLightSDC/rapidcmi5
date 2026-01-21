import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';
import { AxiosResponse } from 'axios';
import { Provider } from 'react-redux';
import { persistor, store } from '../../redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import WelcomePage from './ProjectSelection/SelectProject';
import { useState } from 'react';

export interface buildCmi5ZipParams {
  zipBlob: File;
  zipName: string;
  createAuMappings: boolean;
}

export type SubmitScenarioFormFn<T = any> = (item: T) => void;

// This will exist in app in order to pass the token too
// this prevents needing to pass the token into the package part of the application
// we only need to pass the function for on click
export interface ScenarioFormProps {
  submitForm: SubmitScenarioFormFn;
  token: string;
}

export interface GetScenarioFormProps {
  submitForm: SubmitScenarioFormFn;
}

export interface RapidCmi5Opts {
  authToken?: string;
  buildCmi5Zip?: (params: buildCmi5ZipParams) => Promise<AxiosResponse<object>>;
  GetScenariosForm?: React.ComponentType<GetScenarioFormProps>;
}

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GitContextProvider rapidCmi5Opts={rapidCmi5Opts}>
          <RC5ContextProvider>
            <RC5Modals />
            <Landing />
          </RC5ContextProvider>
        </GitContextProvider>
      </PersistGate>
    </Provider>
  );
}
