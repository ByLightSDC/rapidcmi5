/**
 * This allows us to pass top level information from an application to this rapid cmi5 react component.
 * When using via an npm package this is very important.
 */
import {
  RC5ActivityTypeEnum,
  CourseAU,
  GitUserConfig,
  Credentials,
  ScenarioApi,
  ScenarioQuery,
  PaginatedScenariosResponse,
} from '@rapid-cmi5/cmi5-build-common';
import { Scenario } from '@rapid-cmi5/react-editor';
import { FormCrudType } from '@rapid-cmi5/ui';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export type SubmitScenarioFormFn<T = any> = (item: T) => void;

// A user can pass in their own scenario search modal
export interface ScenarioFormProps extends GetScenarioFormProps {
  listScenarios: (query: ScenarioQuery) => Promise<PaginatedScenariosResponse>;
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
  activityType: RC5ActivityTypeEnum;
}

// A user can pass in their own quiz bank search modal
export interface QuizBankSearchModalProps extends GetQuizBankSearchModalProps {
  url: string;
  token: string;
  currentUserEmail?: string;
}

export interface GetQuizBankAddModalProps {
  closeModal: () => void;
  question: any;
}

// A user can pass in their own quiz bank add modal
export interface QuizBankAddModalProps extends GetQuizBankAddModalProps {
  url: string;
  token: string;
}

export type ApiUrls = {
  quizBankUrl?: string;
  codeRunnerUrl?: string;
};

export type UserAuth = {
  token?: string;
  userName: string;
  userEmail: string;
  gitCredentials?: Credentials;
  apiUser?: string;
};

export interface RapidCmi5Opts {
  userAuth?: UserAuth;
  downloadCmi5Player?: () => Promise<any>;
  processAu?: (au: CourseAU, blockId: string) => Promise<void>;
  GetScenariosForm?: React.ComponentType<GetScenarioFormProps>;
  fetchScenario?: (uuid: string) => Promise<ScenarioApi>;
  QuizBankSearchModal?: React.ComponentType<GetQuizBankSearchModalProps>;
  QuizBankAddModal?: React.ComponentType<GetQuizBankAddModalProps>;
  clearData?: () => void;
  showHomeButton?: boolean;
  clearCache?: () => void;
  handleOverrideGlobalGitConfig?: (
    config?: GitUserConfig,
    creds?: Credentials,
  ) => void;
  apiUrls?: ApiUrls;
}

const RapidCmi5OptsContext = createContext<RapidCmi5Opts>({});

export const RapidCmi5OptsProvider = ({
  opts,
  children,
}: {
  opts: RapidCmi5Opts;
  children: JSX.Element;
}) => {
  return (
    <RapidCmi5OptsContext.Provider value={opts}>
      {children}
    </RapidCmi5OptsContext.Provider>
  );
};

export const useRapidCmi5Opts = () => useContext(RapidCmi5OptsContext);
