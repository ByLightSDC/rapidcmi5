import { Credentials, GitUserConfig } from '@rapid-cmi5/cmi5-build-common';
import {
  RapidCmi5,
  GetScenarioFormProps,
  GetQuizBankAddModalProps,
  GetQuizBankSearchModalProps,
} from '@rapid-cmi5/react-editor';
import { useContext, useMemo } from 'react';
import { ScenarioSelectionForm } from './shared/modals/ScenarioSelectionModal';
import { UserConfigContext } from './contexts/UserConfigContext';
import { AuthContext } from './contexts/AuthContext';
import AddToQuizBankForm from './shared/modals/quizBank/AddToQuizBankForm';
import QuizBankSearchForm from './shared/modals/quizBank/SearchQuizBankForm';
import { useScenarioApi, CourseAU, ScenarioQuery } from '@rapid-cmi5/cmi5-build-common';
import { detectIsElectron } from './utils/appType';
import { rangeApi as electronRangeApi } from './electronApi';

export function RapidCmi5Wrapper() {
  const isElectron = detectIsElectron();

  const { token, parsedUserToken } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig, setGitCredentials, setGitUser } =
    useContext(UserConfigContext);

  const quizBankURL = ssoConfig?.quizBankApiUrl;
  const rangeURL = ssoConfig?.rangeRestApiUrl;

  const { fetchScenario, processAu, listScenarios } = useScenarioApi(
    isElectron ? undefined : rangeURL,
    isElectron ? undefined : token,
  );

  const effectiveFetchScenario = useMemo(() => {
    if (!rangeURL || !token) return undefined;
    if (isElectron) return (uuid: string) => electronRangeApi.fetchScenario(rangeURL, token, uuid);
    return fetchScenario;
  }, [rangeURL, token, isElectron, fetchScenario]);

  const effectiveProcessAu = useMemo(() => {
    if (!rangeURL || !token) return undefined;
    if (isElectron) return (au: CourseAU, blockId: string) => electronRangeApi.processAu(rangeURL, token, au, blockId);
    return processAu;
  }, [rangeURL, token, isElectron, processAu]);

  const effectiveListScenarios = useMemo(() => {
    if (!rangeURL || !token) return undefined;
    if (isElectron) return (query: ScenarioQuery) => electronRangeApi.listScenarios(rangeURL, token, query);
    return listScenarios;
  }, [rangeURL, token, isElectron, listScenarios]);

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
      processAu={effectiveProcessAu}
      fetchScenario={effectiveFetchScenario}
      GetScenariosForm={
        effectiveListScenarios
          ? (props: GetScenarioFormProps) => (
              <ScenarioSelectionForm
                submitForm={props.submitForm}
                formType={props.formType}
                errors={props.errors}
                formMethods={props.formMethods}
                listScenarios={effectiveListScenarios}
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
