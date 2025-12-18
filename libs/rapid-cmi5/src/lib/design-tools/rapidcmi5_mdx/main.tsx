import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';
import { AxiosResponse } from 'axios';

export interface buildCmi5ZipParams {
  zipBlob: File;
  zipName: string;
  createAuMappings: boolean;
}

export interface ScenarioFormProps {
  submitForm: (item: any) => void;
}

export interface RapidCmi5Opts {
  authToken?: string;
  buildCmi5Zip?: (params: buildCmi5ZipParams) => Promise<AxiosResponse<object>>;
  GetScenariosForm?: React.ComponentType<ScenarioFormProps>;
}

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  return (
    <GitContextProvider rapidCmi5Opts={rapidCmi5Opts}>
      <RC5ContextProvider>
        <Landing />
        <RC5Modals />
      </RC5ContextProvider>
    </GitContextProvider>
  );
}
