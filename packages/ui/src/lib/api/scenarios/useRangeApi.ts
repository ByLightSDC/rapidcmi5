import {
  CourseAU,
  createAuMappingNameWithAuId,
  generateAuId,
} from '@rapid-cmi5/cmi5-build-common';
import { useRangeClient } from '../../contexts/ApiContext';
import { scenarioKey } from './queryKeys';
import { keepPreviousData } from '@tanstack/react-query';
import { debugLog, debugLogError } from '../../utility/logger';

export function useRangeApi() {
  const { enabled, client } = useRangeClient();

  /*
   * Resolves a scenario UUID for an AU by UUID first, then by name.
   * Throws if the configured UUID/name does not exist; returns null if neither is set.
   */
  const handleGetAuScenarioUUID = async (au: CourseAU) => {
    if (au.rangeosScenarioUUID) {
      const response = await client.getScenario.query({
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
      const { status, body } = await client.listScenarios.query({
        query: { search: au.rangeosScenarioName },
      });

      if (status !== 200 || !body.data || body.totalCount === 0) {
        throw new Error(
          `No scenario found with name "${au.rangeosScenarioName}" for AU "${au.auName}". ` +
            `Check that the scenario name is correct and exists in this environment.`,
        );
      }
      return body.data.at(0)?.uuid;
    }
    return null;
  };

  const processAu = async (au: CourseAU, blockId: string) => {
    const scenarioUUID = await handleGetAuScenarioUUID(au);
    if (!scenarioUUID) return;

    const auId = generateAuId({ blockId, auName: au.auName });
    return await createAuMapping(auId, scenarioUUID);
  };

  const createAuMapping = async (auId: string, scenarioUUID: string) => {
    const encodedAuId = encodeURIComponent(auId);

    const { body, status } = await client.getAuMapping.query({
      params: { auId },
    });

    if (status === 200) {
      const updateResponse = await client.updateAuMapping.mutate({
        params: { auId: encodedAuId },
        body: { scenarios: [scenarioUUID] },
      });
      if (updateResponse.status !== 200) {
        debugLogError(`Could not update au mapping for auId: ${auId}`);
        throw updateResponse.body;
      }
    } else if (status === 404) {
      const { status } = await client.createAuMapping.mutate({
        body: {
          auId,
          scenarios: [scenarioUUID],
          name: createAuMappingNameWithAuId(auId),
        },
      });
      if (!(status == 201 || status == 200)) {
        debugLog(`Could not create au mapping for auId: ${auId}`);
        throw new Error('Failed to create au');
      }
    } else {
      throw body;
    }
  };

  const searchScenarios = (search: string, limit: number, offset: number) => {
    return client.listScenarios.useQuery({
      queryKey: [
        scenarioKey,
        { search, limit, offset, sortBy: 'dateEdited', sort: 'desc' },
      ],
      queryData: { query: { search, limit, offset } },
      placeholderData: keepPreviousData,
    });
  };

  const getScenario = (scenarioUUID?: string) => {
    return client.getScenario.useQuery({
      queryKey: [scenarioKey, scenarioUUID],
      queryData: { params: { uuid: scenarioUUID ?? '' } },
      enabled: enabled && Boolean(scenarioUUID),
    });
  };

  return {
    processAu,
    handleGetAuScenarioUUID,
    createAuMapping,
    searchScenarios,
    getScenario,
    isRangeEnabled: enabled,
  };
}
