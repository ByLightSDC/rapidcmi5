import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import { CourseData, generateCourseJson } from '@rapid-cmi5/cmi5-build-common';
import { getFolderStructureBackend } from '../fileSystem/fileSystem';
import { generateAllTfJson } from '../build/outputs';

export function registerGenerateAuTerraform(program: Command): void {
  program
    .command('generate-au-terraform')
    .description(
      'Generate au -> scenario terraform mappings for multiple courses',
    )
    .argument('<coursesPath>', 'Path to the directory containing courses')
    .argument('<outputPath>', 'Path to output the tf.json file')
    .action(async (coursesPath, outputPath) => {
      const basePath = path.resolve(coursesPath);
      const tfJsonPath = path.resolve(outputPath);

      const dirEntries = await fs.readdir(basePath, { withFileTypes: true });
      const courses: CourseData[] = [];
      for (const entry of dirEntries) {
        if (entry.isDirectory()) {
          const courseFolderPath = path.join(basePath, entry.name);

          const folderStructure =
            await getFolderStructureBackend(courseFolderPath);
          const courseData = generateCourseJson(folderStructure);

          if (courseData) {
            courses.push(courseData);
          }
        }
      }
      generateAllTfJson(courses, tfJsonPath);
    });
}
