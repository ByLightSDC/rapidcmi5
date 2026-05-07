import { InitClientReturn } from '@ts-rest/core';
import { CourseAU } from '../../types/course';
import { scenarioContract, ScenarioQuery } from '../scenarioContract';
import { generateAuId } from '../../generateCmi5Xml';
import { createAuMappingNameWithAuId } from '../../generateAuConfigs';

type ScenarioClient = InitClientReturn<
  typeof scenarioContract,
  { baseUrl: string }
>;

export const handleGetAuScenarioUUID = async (
  au: CourseAU,
  apiClient: ScenarioClient,
) => {
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
      query: { search: au.rangeosScenarioName },
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
};

export const handleFetchScenario = async (
  uuid: string,
  apiClient: ScenarioClient,
) => {
  const response = await apiClient.getScenario({ params: { uuid } });
  if (response.status === 200) {
    return response.body;
  }
  throw new Error(
    `Failed to fetch scenario "${uuid}" (status: ${response.status})`,
  );
};

export const handleListScenarios = async (
  query: ScenarioQuery,
  apiClient: ScenarioClient,
) => {
  const response = await apiClient.listScenarios({ query });
  if (response.status === 200) {
    return response.body;
  }
  throw new Error(`Failed to list scenarios (status: ${response.status})`);
};

export const handleProcessAu = async (
  au: CourseAU,
  blockId: string,
  apiClient: ScenarioClient,
) => {
  const scenarioUUID = await handleGetAuScenarioUUID(au, apiClient);
  if (!scenarioUUID) return;

  const auId = generateAuId({ blockId, auName: au.auName });
  // ts-rest does not encodeURIComponent path params; auId can be a URL with
  // slashes that would break server-side path routing if not encoded first.
  const encodedAuId = encodeURIComponent(auId);
  let existingMapping: Awaited<ReturnType<typeof apiClient.getAuMapping>>;
  try {
    existingMapping = await apiClient.getAuMapping({
      params: { auId: encodedAuId },
    });
  } catch {
    existingMapping = { status: 404, body: null } as any;
  }

  if (existingMapping.status === 200) {
    const updateResponse = await apiClient.updateAuMapping({
      params: { auId: encodedAuId },
      body: { scenarios: [scenarioUUID] },
    });
    if (updateResponse.status !== 200) {
      console.error(`Could not update au mapping for auId: ${auId}`);
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
    if (!(createResponse.status == 201 || createResponse.status == 200)) {
      console.error(`Could not create au mapping for auId: ${auId}`);
      throw new Error('Failed to create au');
    }
  } else {
    throw existingMapping.body;
  }
};
