import path from 'path';
import { generateAllAuMappings } from './generateAuMappings';
import { generateCourseJson } from '@rapid-cmi5/cmi5-build/common';
import { getFolderStructureBackend } from '@rapid-cmi5/cmi5-build/backend';

import { coursePaths } from '@rapid-cmi5/cmi5-build/backend';

describe('Create AU mapping tf file', () => {
  it('should generate correct au mapping tf.json from basicCourseNoNav', async () => {
    const filePath = path.join(coursePaths.basicCourseNoNav);
    const folderStructure = await getFolderStructureBackend(filePath);
    const courseData = generateCourseJson(folderStructure);

    expect(courseData).toBeDefined();
    if (!courseData) return;

    // Inject test scenarios
    courseData.blocks[0].aus[0].rangeosScenarioName = 'TEST SCENARIO';
    courseData.blocks[0].aus[1].rangeosScenarioUUID = '4444-4444-4444-4444';

    const tfJson = generateAllAuMappings([courseData]);

    // Test AU mappings
    const auMappings = tfJson.resource.rangeos_cmi5aumapping;
    expect(Object.keys(auMappings).length).toBeGreaterThan(0);

    const mappingValues = Object.values(auMappings);

    // Check that each mapping has required fields
    for (const mapping of mappingValues) {
      expect(mapping).toHaveProperty('au_id');
      expect(mapping).toHaveProperty('name');
      expect(mapping).toHaveProperty('scenarios');
      expect(Array.isArray(mapping.scenarios)).toBe(true);
    }

    // Test scenario data section
    const scenarioData = tfJson.data.rangeos_scenario;
    expect(Object.keys(scenarioData).length).toBe(2);
    expect(
      Object.values(scenarioData).some(s => s.name === 'TEST SCENARIO')
    ).toBe(true);
    expect(
      Object.values(scenarioData).some(s => s.uuid === '4444-4444-4444-4444')
    ).toBe(true);
  });

  
});
