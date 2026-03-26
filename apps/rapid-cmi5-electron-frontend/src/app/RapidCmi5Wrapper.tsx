import {
  overrideDevOpsApiClient,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  CourseAU,
  createAuMappingNameWithAuId,
  Credentials,
  generateAuId,
  GitUserConfig,
} from '@rapid-cmi5/cmi5-build-common';
import {
  RapidCmi5,
  GetScenarioFormProps,
  GetQuizBankAddModalProps,
  GetQuizBankSearchModalProps,
} from '@rapid-cmi5/react-editor';
import { debugLogError } from '@rapid-cmi5/ui';
import { useContext, useEffect, useMemo } from 'react';
import { ScenarioSelectionForm } from './shared/modals/ScenarioSelectionModal';
import { UserConfigContext } from './contexts/UserConfigContext';
import { AuthContext } from './contexts/AuthContext';
import AddToQuizBankForm from './shared/modals/quizBank/AddToQuizBankForm';
import QuizBankSearchForm from './shared/modals/quizBank/QuizBankSearchForm';
import axios from 'axios';

export function RapidCmi5Wrapper() {
  const { token, parsedUserToken } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig, setGitCredentials, setGitUser } =
    useContext(UserConfigContext);

  const quizBankURL = ssoConfig?.quizBankApiUrl;
  const quizBankApiClient = useMemo(() => {
    return axios.create({
      baseURL: quizBankURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, [quizBankURL]);

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
    overrideDevOpsApiClient(ssoConfig?.rangeRestApiUrl);
  }, [ssoConfig?.rangeRestApiUrl]);

  // Git global config overrides the keycloak name and email
  const userFullName =
    gitUser?.authorName || parsedUserToken?.name?.toLowerCase() || '';
  const userEmail =
    gitUser?.authorEmail || parsedUserToken?.email?.toLowerCase() || '';

  const getAuScenarioUUID = async (au: CourseAU) => {
    let scenarioUUID = null;

    if (au.rangeosScenarioUUID) {
      scenarioUUID = au.rangeosScenarioUUID;
    } else if (au.rangeosScenarioName) {
      const matchingScenarios = await DevopsApiClient.scenariosList(
        undefined,
        au.rangeosScenarioName,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        !matchingScenarios.data.data ||
        matchingScenarios.data.totalCount === 0
      ) {
        debugLogError(`No matching scenario found for AU "${au.auName}"`);
        return null;
      }

      scenarioUUID = matchingScenarios.data.data?.at(0)?.uuid;
    }
    return scenarioUUID;
  };

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
      processAu={async (au: CourseAU, blockId: string) => {
        const scenarioUUID = await getAuScenarioUUID(au);

        if (!scenarioUUID) return;

        const auId = generateAuId({ blockId, auName: au.auName });
        let cmi5CourseMapping;
        try {
          cmi5CourseMapping = await DevopsApiClient.cmi5AuMappingRetrieve(
            auId,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (err: any) {
          if (err.status !== 404) {
            throw err;
          }
        }

        // update if mapping exists
        if (cmi5CourseMapping) {
          try {
            await DevopsApiClient.cmi5AuMappingUpdate(
              auId,
              {
                scenarios: [scenarioUUID],
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          } catch (err) {
            debugLogError(`Could not update au mapping for auId: ${auId}`);
            throw err;
          }
        }
        // create if mapping does not
        else {
          try {
            await DevopsApiClient.cmi5AuMappingCreate(
              {
                auId,
                scenarios: [scenarioUUID],
                name: createAuMappingNameWithAuId(auId),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          } catch (err) {
            debugLogError(`Could not create au mapping for auId: ${auId}`);
            throw err;
          }
        }
      }}
      GetScenariosForm={
        token
          ? (props: GetScenarioFormProps) => (
              <ScenarioSelectionForm
                token={token}
                submitForm={props.submitForm}
                formType={props.formType}
                errors={props.errors}
                formMethods={props.formMethods}
                url={ssoConfig?.rangeRestApiUrl}
              />
            )
          : undefined
      }
      QuizBankAddModal={(props: GetQuizBankAddModalProps) =>
        token && parsedUserToken?.email?.toLowerCase() ? (
          <AddToQuizBankForm
            token={token}
            closeModal={props.closeModal}
            formType={props.formType}
            errors={props.errors}
            formMethods={props.formMethods}
            url={ssoConfig?.quizBankApiUrl}
            question={props.question}
            apiClient={quizBankApiClient}
          />
        ) : undefined
      }
      QuizBankSearchModal={(props: GetQuizBankSearchModalProps) =>
        token ? (
          <QuizBankSearchForm
            token={token}
            submitForm={props.submitForm}
            formType={props.formType}
            errors={props.errors}
            formMethods={props.formMethods}
            url={ssoConfig?.quizBankApiUrl}
            closeModal={props.closeModal}
            currentUserEmail={parsedUserToken?.email?.toLowerCase()}
            activityType={props.activityType}
            apiClient={quizBankApiClient}
          />
        ) : undefined
      }
    />
  );
}
