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
import axios from 'axios';

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
      codeRunnerOps={{
        executeCode: async (content: string) => {
          const response = await axios.get(
            `http://localhost:8080/v1/cmi5/code-runner/languages`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log('data', response);

          return { stderr: 'failed', stdout: '' };
        },
        listRuntimes: async () => {
          const response = await axios.get(
            `http://localhost:8080/v1/cmi5/code-runner/languages`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log('data', response);
          return response.data;
        },
      }}
    />
  );
}
