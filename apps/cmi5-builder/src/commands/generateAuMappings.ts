import { CourseData, createAuMappingName, generateAuId, generateBlockId } from '@rapid-cmi5/cmi5-build-common';

type TfDict = {
  resource: {
    rangeos_cmi5aumapping: Record<string, any>;
  };
  data: {
    rangeos_scenario: Record<string, any>;
  };
};

export function generateAllAuMappings(coursesData: CourseData[]) {
  const tfDict: TfDict = {
    resource: {
      rangeos_cmi5aumapping: {},
    },
    data: {
      rangeos_scenario: {},
    },
  };

  const scenarioKeyMap = new Map<string, number>();

  for (const course of coursesData) {
    generateAuMappings(course, tfDict, scenarioKeyMap);
  }

  return tfDict;
}

export function generateAuMappings(
  courseData: CourseData,
  tfDict: TfDict,
  scenarioKeyMap: Map<string, number>,
) {
  for (const block of courseData.blocks) {
    const blockId = generateBlockId({
      courseId: courseData.courseId,
      blockName: block.blockName,
    });

    for (const au of block.aus) {
      const scenarioIdentifier =
        au.rangeosScenarioUUID || au.rangeosScenarioName;
      if (!scenarioIdentifier) continue;

      let scenarioIndex: number;

      if (scenarioKeyMap.has(scenarioIdentifier)) {
        scenarioIndex = scenarioKeyMap.get(scenarioIdentifier)!;
        console.log(
          `Scenario ${scenarioIdentifier} already added to data object`,
        );
      } else {
        scenarioIndex = scenarioKeyMap.size;
        scenarioKeyMap.set(scenarioIdentifier, scenarioIndex);
        tfDict.data.rangeos_scenario[`scenario-${scenarioIndex}`] =
          au.rangeosScenarioUUID
            ? { uuid: au.rangeosScenarioUUID }
            : { name: au.rangeosScenarioName };
      }

      const auId = generateAuId({ blockId: blockId, auName: au.auName });

      const scenarioKey = `scenario-${scenarioIndex}`;

      const auMapping = {
        au_id: auId,
        name: `${courseData.courseTitle} au: ${au.auName}`.slice(0, 50),
        scenarios: [`\${data.rangeos_scenario.${scenarioKey}.uuid}`],
      };

      tfDict.resource.rangeos_cmi5aumapping[
        createAuMappingName(courseData.courseTitle, block.blockName, au.auName)
      ] = auMapping;
    }
  }

  return tfDict;
}
