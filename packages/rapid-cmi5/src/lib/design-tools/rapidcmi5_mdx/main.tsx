import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';
import { Provider } from 'react-redux';
import { persistor, store } from '../../redux/store';
import { PersistGate } from 'redux-persist/integration/react';

import { UseFormReturn } from 'react-hook-form';
import { FormCrudType } from '@rapid-cmi5/ui';
import {
  CourseAU,
  Credentials,
  GitUserConfig,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

export type SubmitScenarioFormFn<T = any> = (item: T) => void;

// This will exist in app in order to pass the token too
// this prevents needing to pass the token into the package part of the application
// we only need to pass the function for on click

export interface ScenarioFormProps {
  submitForm: SubmitScenarioFormFn;
  token: string;
  url?: string;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  errors: any;
}

export interface GetScenarioFormProps {
  submitForm: SubmitScenarioFormFn;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  errors: any;
}

export interface GetQuizBankSearchModalProps {
  submitForm: SubmitScenarioFormFn;
  closeModal: () => void;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  activityType: RC5ActivityTypeEnum;
  errors: any;
}

export interface GetQuizBankAddModalProps {
  closeModal: () => void;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  errors: any;
  question: any;
}

export interface QuizBankSearchModalProps {
  submitForm: SubmitScenarioFormFn;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  errors: any;
  token: string;
  url?: string;
  closeModal: () => void;
  activityType: RC5ActivityTypeEnum;
  currentUserEmail?: string;
}

export interface QuizBankAddModalProps {
  closeModal: () => void;
  formMethods: UseFormReturn;
  formType: FormCrudType;
  errors: any;
  token: string;
  url?: string;
  question: any;
}

export interface RapidCmi5Opts {
  userAuth?: UserAuth;
  downloadCmi5Player?: () => Promise<any>;
  processAu?: (au: CourseAU, blockId: string) => Promise<void>;
  GetScenariosForm?: React.ComponentType<GetScenarioFormProps>;
  QuizBankSearchModal?: React.ComponentType<GetQuizBankSearchModalProps>;
  QuizBankAddModal?: React.ComponentType<GetQuizBankAddModalProps>;
  clearData?: () => void;
  showHomeButton?: boolean;
  clearCache?: () => void;
  handleOverrideGlobalGitConfig?: (
    config?: GitUserConfig,
    creds?: Credentials,
  ) => void;
}

export type UserAuth = {
  token?: string;
  userName: string;
  userEmail: string;
  gitCredentials?: Credentials;
  apiUser?: string;
};

export function RapidCmi5(rapidCmi5Opts: RapidCmi5Opts) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GitContextProvider rapidCmi5Opts={rapidCmi5Opts}>
          <RC5ContextProvider>
            <RC5Modals />
            <Landing showHomeButton={rapidCmi5Opts.showHomeButton} />
          </RC5ContextProvider>
        </GitContextProvider>
      </PersistGate>
    </Provider>
  );
}
