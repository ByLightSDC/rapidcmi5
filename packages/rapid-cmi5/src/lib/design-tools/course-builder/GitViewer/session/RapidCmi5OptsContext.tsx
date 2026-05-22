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

import { FormCrudType } from '@rapid-cmi5/ui';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export type ApiUrls = {
  quizBankUrl?: string;
  codeRunnerUrl?: string;
  rangeUrl?: string;
};

export type UserAuth = {
  token?: string;
  userName: string;
  userEmail: string;
  gitCredentials?: Credentials;
  apiUser?: string;
};

export type AiPanelMode = 'claude' | 'codex' | 'terminal';

export interface RapidCmi5Opts {
  userAuth?: UserAuth;
  downloadCmi5Player?: () => Promise<any>;
  processAu?: (au: CourseAU, blockId: string) => Promise<void>;
  createAuMapping?: (auId: string, scenerioUUID: string) => Promise<void>;
  fetchScenario?: (uuid: string) => Promise<ScenarioApi>;
  handleOverrideGlobalGitConfig?: (
    config?: GitUserConfig,
    creds?: Credentials,
  ) => void;
  apiUrls?: ApiUrls;
  onAiClick?: (mode: AiPanelMode) => void;
  aiThinking?: boolean;
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
