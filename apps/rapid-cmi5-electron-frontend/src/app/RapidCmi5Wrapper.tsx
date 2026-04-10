import { overrideDevOpsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  CourseAU,
  Credentials,
  GitUserConfig,
} from '@rapid-cmi5/cmi5-build-common';
import {
  RapidCmi5,
  GetScenarioFormProps,
  GetQuizBankAddModalProps,
  GetQuizBankSearchModalProps,
} from '@rapid-cmi5/react-editor';
import { useContext, useEffect } from 'react';
import { ScenarioSelectionForm } from './shared/modals/ScenarioSelectionModal';
import { UserConfigContext } from './contexts/UserConfigContext';
import { AuthContext } from './contexts/AuthContext';
import AddToQuizBankForm from './shared/modals/quizBank/AddToQuizBankForm';
import QuizBankSearchForm from './shared/modals/quizBank/SearchQuizBankForm';
import { fetchScenario, processAu } from './utils/scenarioHelpers';

export function RapidCmi5Wrapper() {
  const { token, parsedUserToken } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig, setGitCredentials, setGitUser } =
    useContext(UserConfigContext);

  const quizBankURL = ssoConfig?.quizBankApiUrl;
  const rangeURL = ssoConfig?.rangeRestApiUrl;

  const handleOverrideGlobalGitConfig = (
    config?: GitUserConfig,
    creds?: Credentials,
  ) => {
    if (config) {
      setGitUser(config);
    }
    if (setGitCredentials && creds) {
      setGitCredentials(creds);
    }
  };

  useEffect(() => {
    overrideDevOpsApiClient(rangeURL);
  }, [rangeURL]);

  // Git global config overrides the keycloak name and email
  const userFullName =
    gitUser?.authorName || parsedUserToken?.name?.toLowerCase() || '';
  const userEmail =
    gitUser?.authorEmail || parsedUserToken?.email?.toLowerCase() || '';

  return (
    <RapidCmi5
      handleOverrideGlobalGitConfig={handleOverrideGlobalGitConfig}
      showHomeButton={true}
      userAuth={{
        token,
        userEmail: userEmail,
        userName: userFullName,
        gitCredentials,
        apiUser: parsedUserToken?.email?.toLowerCase(),
      }}
      downloadCmi5Player={async () => {
        const response = await fetch('/assets/cc-cmi5-player.zip');
        return response;
      }}
      processAu={
        token && rangeURL
          ? async (au: CourseAU, blockId: string) => {
              await processAu(au, blockId, token);
            }
          : undefined
      }
      fetchScenario={
        token
          ? async (uuid: string) => await fetchScenario(uuid, token)
          : undefined
      }
      GetScenariosForm={
        token && rangeURL
          ? (props: GetScenarioFormProps) => (
              <ScenarioSelectionForm
                token={token}
                submitForm={props.submitForm}
                formType={props.formType}
                errors={props.errors}
                formMethods={props.formMethods}
                url={rangeURL}
              />
            )
          : undefined
      }
      QuizBankAddModal={
        quizBankURL && token
          ? (props: GetQuizBankAddModalProps) => (
              <AddToQuizBankForm
                closeModal={props.closeModal}
                question={props.question}
                url={quizBankURL}
                token={token}
              />
            )
          : undefined
      }
      QuizBankSearchModal={
        quizBankURL && token
          ? (props: GetQuizBankSearchModalProps) => (
              <QuizBankSearchForm
                closeModal={props.closeModal}
                activityType={props.activityType}
                submitForm={props.submitForm}
                currentUserEmail={userEmail}
                url={quizBankURL}
                token={token}
              />
            )
          : undefined
      }
      apiUrls={{
        codeRunnerUrl: rangeURL,
        quizBankUrl: quizBankURL,
      }}
    />
  );
}
