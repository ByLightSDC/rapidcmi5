import { useCallback, useMemo } from 'react';
import { initClient } from '@ts-rest/core';
import { scenarioContract, ScenarioApi } from '../scenarioContract';
import {
  CourseAU,
  createAuMappingNameWithAuId,
  generateAuId,
} from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '@rapid-cmi5/ui';

export function useScenarioApi(url?: string, token?: string) {
  const apiClient = useMemo(
    () =>
      url && token
        ? initClient(scenarioContract, {
            baseUrl: url,
            baseHeaders: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          })
        : undefined,
    [url, token],
  );

  const fetchScenarioCb = useCallback(
    async (uuid: string): Promise<ScenarioApi> => {
      if (!apiClient) throw new Error('API client is not set');
      const response = await apiClient.getScenario({ params: { uuid } });
      if (response.status === 200) {
        return response.body;
      }
      throw new Error(
        `Failed to fetch scenario "${uuid}" (status: ${response.status})`,
      );
    },
    [apiClient],
  );

  const processAuCb = useCallback(
    async (au: CourseAU, blockId: string): Promise<void> => {
      if (!apiClient) throw new Error('API client is not set');

      const scenarioUUID = await getAuScenarioUUID(au);
      if (!scenarioUUID) return;

      const auId = generateAuId({ blockId, auName: au.auName });
      // ts-rest does not encodeURIComponent path params; auId can be a URL with
      // slashes that would break server-side path routing if not encoded first.
      const encodedAuId = encodeURIComponent(auId);
      const existingMapping = await apiClient.getAuMapping({
        params: { auId: encodedAuId },
      });

      if (existingMapping.status === 200) {
        const updateResponse = await apiClient.updateAuMapping({
          params: { auId: encodedAuId },
          body: { scenarios: [scenarioUUID] },
        });
        if (updateResponse.status !== 200) {
          debugLogError(`Could not update au mapping for auId: ${auId}`);
          throw updateResponse.body;
        }
      } else if (existingMapping.status === 404) {
        const createResponse = await apiClient.createAuMapping({
          body: {
            auId,
            scenarios: [scenarioUUID],
            name: createAuMappingNameWithAuId(auId),
          },
        });
        if (createResponse.status !== 201) {
          debugLogError(`Could not create au mapping for auId: ${auId}`);
          throw new Error('Failed to create au');
        }
      } else {
        throw existingMapping.body;
      }
    },
    [apiClient],
  );

  async function getAuScenarioUUID(au: CourseAU) {
    if (!apiClient) throw new Error('API client is not set');
    if (au.rangeosScenarioUUID) {
      const response = await apiClient.getScenario({
        params: { uuid: au.rangeosScenarioUUID },
      });
      if (response.status === 200) {
        return au.rangeosScenarioUUID;
      }
      throw new Error(
        `Scenario UUID "${au.rangeosScenarioUUID}" does not exist in this environment.\n` +
          `Lesson: "${au.auName}". \n` +
          `Update the scenario UUID or remove it from the AU settings.`,
      );
    }

    if (au.rangeosScenarioName) {
      const response = await apiClient.listScenarios({
        query: { name: au.rangeosScenarioName },
      });
      if (
        response.status !== 200 ||
        !response.body.data ||
        response.body.totalCount === 0
      ) {
        throw new Error(
          `No scenario found with name "${au.rangeosScenarioName}" for AU "${au.auName}". ` +
            `Check that the scenario name is correct and exists in this environment.`,
        );
      }
      return response.body.data.at(0)?.uuid;
    }

    return null;
  }

  const fetchScenario = apiClient ? fetchScenarioCb : undefined;
  const processAu = apiClient ? processAuCb : undefined;

  return { fetchScenario, processAu };
}
