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

  /**
   * Resolves a RangeOS scenario UUID for an AU (Assignable Unit), preferring
   * `rangeosScenarioUUID` and falling back to a name search via
   * `rangeosScenarioName`. Returns `null` when neither field is set on the AU.
   *
   * Throws a user-facing error if the configured UUID or name does not
   * exist in the current environment — this is the common failure mode
   * when promoting a course between tenants where scenarios have not yet
   * been replicated.
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

  /**
   * Full pipeline for binding an AU to its RangeOS scenario at publish/
   * import time: resolves the scenario UUID, computes the deterministic
   * `auId` from `{ blockId, auName }`, then upserts the AU mapping on the
   * Range side. No-ops when no scenario is configured on the AU.
   */
  const processAu = async (au: CourseAU, blockId: string) => {
    const scenarioUUID = await handleGetAuScenarioUUID(au);
    if (!scenarioUUID) return;

    const auId = generateAuId({ blockId, auName: au.auName });
    return await createAuMapping(auId, scenarioUUID);
  };

  /**
   * Upserts the Range-side AU mapping that ties an `auId` to a scenario
   * UUID: GETs the existing mapping, PATCHes it when present (200) or
   * POSTs a new one when absent (404). Other statuses are re-thrown so
   * callers see the underlying error rather than a silent miss.
   */
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

  /**
   * Paged scenario search sorted by `dateEdited desc`. Uses
   * `keepPreviousData` so the list does not flash empty between pages,
   * which matters for the scenario-picker UX.
   */
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

  /**
   * Fetches a single scenario by UUID. Disabled when `scenarioUUID` is
   * falsy so the picker/preview can mount and call the hook before the
   * user has made a selection.
   */
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
