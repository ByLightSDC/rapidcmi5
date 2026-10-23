import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml';
import { CourseMeta } from '../build/courseOverrides';
import { buildCmi5 } from '../build/buildCmi5';
import { zipCmi5 } from '../build/outputs';
import { AuMappingService } from '../services/auMappingService';
import { OpendashUploadService } from '../services/openDash/opendashUploadService';

export function registerBuildOpendash(program: Command): void {
  program
    .command('build-opendash')
    .description(
      'Build and upload course content to OpenDash and create AU mappings',
    )
    .argument('<coursePath>', 'Path to the course folder')
    .argument('<distPath>', 'Path to the output dist folder')
    .argument('<endpoint>', 'opendash endpoint')
    .option(
      '--apply-au-mappings <endpoint>',
      'Create AU mappings Specific to Opendash Format (AU ID -> Scenario) at endpoint',
    )
    .option(
      '--course-meta <yamlPath>',
      'Path to optional YAML file to override course metadata',
    )
    .option(
      '--use-real-auid',
      'For newer versions of opendash you may use the auid instead of the random uuid generated',
    )
    .option('--zip <path>', 'Create a ZIP of the output directory')
    .option('--convert', 'convert from mkdocs')

    .action(async (coursePath, distPath, endpoint, options) => {
      console.log('Uploading to opendash...');
      const inputPath = path.resolve(coursePath);
      const outputPath = path.resolve(distPath);

      let overrideData;
      console.log('use real ', options.useRealAuid);

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

      const jwtDevopsApi = process.env['JWT_DEVOPS_API'];
      const jwtOpendash = process.env['JWT_OPENDASH'];

      if (jwtDevopsApi && jwtOpendash) {
        console.log('📊  Uploading zip to opendash...');
        const mappingEndpoint = options.applyAuMappings;

        const auMappingService = new AuMappingService({
          baseUrl: mappingEndpoint,
          jwt: jwtDevopsApi,
        });

        const useRealAuid = options.useRealAuid !== undefined;

        const uploader = new OpendashUploadService({
          jwt: jwtOpendash,
          baseUrl: endpoint,
          useRealAuid: useRealAuid,
        });
        await uploader.uploadCourse(
          courseData,
          auMappingService,
          zipPath,
          options.applyAuMappings,
        );
      } else {
        console.log(
          `❌  No JWT was provided for either opendash ${jwtOpendash ? 'true' : false} or ros ${jwtDevopsApi ? 'true' : 'false'}`,
        );
      }
    });
}
