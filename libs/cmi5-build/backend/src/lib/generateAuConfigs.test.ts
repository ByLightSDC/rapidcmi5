import path from 'path';
import { generateCourseDist } from './generateAuConfigs';
import { generateCourseJson } from '@rapid-cmi5/cmi5-build-common';
import { getFolderStructureBackend } from './fileSystem';
import fs from 'fs';
import os from 'os';
import { coursePaths } from './constants'
describe('Create CMI5 dist folder', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmi5-test-dist'));
    fs.writeFileSync(path.join(tempDir, 'index.html'), '<html><body>Test</body></html>');
    fs.writeFileSync(path.join(tempDir, 'cfg.json'), '{}');
  
  });
  
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true });
  });
  it('Basic Course generate course output', async () => {
    const folderStructure = await getFolderStructureBackend(
      coursePaths.basicCourseNoNav,
    );

    const courseData = generateCourseJson(folderStructure);

    if (!courseData) {
      console.error('Course data is null');
    } else {
      await generateCourseDist(coursePaths.basicCourseNoNav, tempDir, courseData);

      for (const block of courseData.blocks)
      {
        for (const au of block.aus)
        {
          const auPath = path.join(tempDir, "compiled_course", "blocks", au.dirPath || "");
          const configPath = path.join(auPath, 'config.json');
          const indexPath = path.join(auPath, 'index.html');
  
          expect(fs.existsSync(auPath)).toBe(true);
          expect(fs.existsSync(configPath)).toBe(true);
          expect(fs.existsSync(indexPath)).toBe(true);
        }
      }
    }

    

  });
});
