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
import { RapidCmi5, GetScenarioFormProps } from '@rapid-cmi5/react-editor';
import { debugLogError } from '@rapid-cmi5/ui';
import { useContext, useEffect } from 'react';
import { ScenarioSelectionForm } from './shared/modals/ScenarioSelectionModal';
import { UserConfigContext } from './contexts/UserConfigContext';
import { AuthContext } from './contexts/AuthContext';
import { IQuizBankContext } from 'packages/rapid-cmi5/src/lib/contexts/QuizBankContext';
import axios from 'axios';
import { QuestionType } from 'packages/rapid-cmi5/src/lib/design-tools/course-builder/modals/QuizBank/QuizBankSearchForm';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // change to your backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function RapidCmi5Wrapper() {
  const { token, parsedUserToken } = useContext(AuthContext);
  const { gitUser, gitCredentials, ssoConfig, setGitCredentials, setGitUser } =
    useContext(UserConfigContext);

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

  const quizBankContextProps: IQuizBankContext = {
    addToQuizBank: async (question: QuestionType) => {
      try {
        const response = await apiClient.post(
          '/v1/quizBank/questionBank',
          {
            quizId: question.questionData,
            rc5Version: 1,
            tags: question.tags,
            quizQuestion: question.questionData,
            question: question.question
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        return response.data;
      } catch (error) {
        console.error('Failed to add question to quiz bank', error);
        throw error;
      }
    },
    searchQuizBank: async (query: string, mode: 'tags' | 'question') => {
      try {
        const params: Record<string, string | number> = {
          offset: 0,
          limit: 20,
          sortBy: 'dateEdited',
          sort: 'desc',
          search: query.trim(),
        };

        const response = await apiClient.get(
          '/v1/quizBank/questionBank',
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          },
        );

        console.log("Main data", response)
        return response.data.data;
      } catch (error) {
        console.error('Failed to add question to quiz bank', error);
        throw error;
      }
    },
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
      quizBankContextProps={quizBankContextProps}
    />
  );
}
