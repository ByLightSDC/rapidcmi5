import { useCallback, useMemo } from 'react';
import { initClient } from '@ts-rest/core';
import {
  scenarioContract,
  ScenarioApi,
  ScenarioQuery,
  PaginatedScenariosResponse,
} from '../scenarioContract';
import { CourseAU } from '../../types/courseStructure/course';
import {
  handleCreateAuMapping,
  handleFetchScenario,
  handleListScenarios,
  handleProcessAu,
} from '../utils/scenario';

export function useScenarioApi(url?: string, token?: string) {
  const apiClient = useMemo(
    () =>
      url && token
        ? initClient(scenarioContract, {
            baseUrl: url,
            baseHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : undefined,
    [url, token],
  );

  const fetchScenarioCb = useCallback(
    async (uuid: string): Promise<ScenarioApi> => {
      if (!apiClient) throw new Error('API client is not set');
      return await handleFetchScenario(uuid, apiClient);
    },
    [apiClient],
  );

  const listScenariosCb = useCallback(
    async (query: ScenarioQuery): Promise<PaginatedScenariosResponse> => {
      if (!apiClient) throw new Error('API client is not set');
      return await handleListScenarios(query, apiClient);
    },
    [apiClient],
  );

  const processAuCb = useCallback(
    async (au: CourseAU, blockId: string): Promise<void> => {
      if (!apiClient) throw new Error('API client is not set');
      return await handleProcessAu(au, blockId, apiClient);
    },
    [apiClient],
  );

  const creatAuMappingCb = useCallback(
    async (auId: string, scenarioUUID: string): Promise<void> => {
      if (!apiClient) throw new Error('API client is not set');
      return await handleCreateAuMapping(auId, scenarioUUID, apiClient);
    },
    [apiClient],
  );

  const fetchScenario = apiClient ? fetchScenarioCb : undefined;
  const listScenarios = apiClient ? listScenariosCb : undefined;
  const processAu = apiClient ? processAuCb : undefined;
  const createAuMapping = apiClient ? creatAuMappingCb : undefined;

  return { fetchScenario, listScenarios, processAu, createAuMapping };
}
