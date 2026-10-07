import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml';
import { CourseMeta } from '../build/courseOverrides';
import { buildCmi5 } from '../build/buildCmi5';
import { zipCmi5 } from '../build/outputs';
import { MoodleUploadServiceV2 } from '../services/moodle/moodleUploadServiceV2';

export function registerBuildMoodle(program: Command): void {
  program
    .command('build-moodle')
    .description(
      'Build and upload course content to Moodle and create AU mappings',
    )
    .argument('<coursePath>', 'Path to the course folder')
    .argument('<distPath>', 'Path to the output dist folder')
    .argument('<endpoint>', 'moodle endpoint')
    .option(
      '--apply-au-mappings <endpoint>',
      'Create AU mappings Specific to Opendash Format (AU ID -> Scenario) at endpoint',
    )
    .option('--zip <path>', 'Create a ZIP of the output directory')
    .action(async (coursePath, distPath, endpoint, options) => {
      console.log(`Uploading to moodle at ${endpoint}...`);

      const inputPath = path.resolve(coursePath);
      const outputPath = path.resolve(distPath);

      let overrideData;

      if (options.courseMeta) {
        try {
          const fileContents = await fs.readFile(options.courseMeta, 'utf8');
          overrideData = YAML.parse(fileContents) as CourseMeta;
          console.log('📄 Loaded override YAML:', overrideData);
        } catch (err) {
          console.error('❌ Failed to load override file:', err);
          process.exit(1);
        }
      }
      const courseData = await buildCmi5(
        inputPath,
        outputPath,
        overrideData,
        options.convert,
      );

      if (courseData === null) return;

      const zipPath = path.resolve(
        typeof options.zip === 'string'
          ? options.zip
          : path.join(process.cwd(), 'cmi5-output', 'cmi5.zip'),
      );

      zipCmi5(outputPath, zipPath);

      const moodleWsToken = process.env['MOODLE_WS_TOKEN'];

      if (moodleWsToken) {
        console.log('📊  Uploading zip to moodle...');
        const uploader = new MoodleUploadServiceV2({
          baseUrl: endpoint,
          wstoken: moodleWsToken,
        });

        await uploader.uploadCourse({
          projectIdentifier: courseData.courseId,
          projectName: courseData.courseTitle,
          zipPath,
        });
      } else {
        console.log(
          `❌  No TOKEN was provided for moodleWsToken ${moodleWsToken}`,
        );
      }
    });
}
