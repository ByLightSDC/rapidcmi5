import {
  CourseAU,
  createAuMappingNameWithAuId,
  generateAuId,
} from '@rapid-cmi5/cmi5-build-common';
import {
  DevopsApiClient,
  Scenario,
} from '@rangeos-nx/frontend/clients/devops-api';
import { debugLogError } from '@rapid-cmi5/ui';

export async function fetchScenario(
  uuid: string,
  token: string,
): Promise<Scenario> {
  const response = await DevopsApiClient.scenariosRetrieve(uuid, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getAuScenarioUUID(au: CourseAU, token: string) {
  let scenarioUUID = null;

  if (au.rangeosScenarioUUID) {
    try {
      const result = await DevopsApiClient.scenariosRetrieve(
        au.rangeosScenarioUUID,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (result.data) {
        scenarioUUID = au.rangeosScenarioUUID;
      }
    } catch {
      throw new Error(
        `Scenario UUID "${au.rangeosScenarioUUID}" does not exist in this environment.\n
         Lesson: "${au.auName}". \n
         Update the scenario UUID or remove it from the AU settings.`,
      );
    }
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
      throw new Error(
        `No scenario found with name "${au.rangeosScenarioName}" for AU "${au.auName}". Check that the scenario name is correct and exists in this environment.`,
      );
    }

    scenarioUUID = matchingScenarios.data.data?.at(0)?.uuid;
  }
  return scenarioUUID;
}

export async function processAu(au: CourseAU, blockId: string, token: string) {
  const scenarioUUID = await getAuScenarioUUID(au, token);

  if (!scenarioUUID) return;

  const auId = generateAuId({ blockId, auName: au.auName });
  let cmi5CourseMapping;
  try {
    cmi5CourseMapping = await DevopsApiClient.cmi5AuMappingRetrieve(auId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
      throw Error('Failed to create au');
    }
  }
}
