import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml';
import { CourseMeta } from '../build/courseOverrides';
import { buildCmi5 } from '../build/buildCmi5';
import { zipCmi5, generateTfJson } from '../build/outputs';
import { AuMappingService } from '../services/auMappingService';

export function registerBuild(program: Command): void {
  program
    .command('build')
    .description('Generate cmi5 content from a course directory')
    .argument(
      '<coursePath>',
      'Path to the course folder, should contain an mkdocs file',
    )
    .argument('<distPath>', 'Path to the cmi5 player dist folder')
    .option(
      '--generate-tf [path]',
      'Create a tf.json file for the course AU mappings (optional output path)',
    )
    .option('--zip [path]', 'Create a ZIP of the output directory')
    .option(
      '--apply-au-mappings <endpoint>',
      'Create AU mappings (AU ID -> Scenario) at endpoint',
    )
    .option(
      '--course-meta <yamlPath>',
      'Path to optional YAML file to override course metadata',
    )
    .option('--convert', 'convert from mkdocs')

    .action(async (coursePath, distPath, options) => {
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

      if (options.zip) {
        const zipPath = path.resolve(
          typeof options.zip === 'string'
            ? options.zip
            : path.join(process.cwd(), 'cmi5-output', 'cmi5.zip'),
        );

        zipCmi5(outputPath, zipPath);
      }

      if (!courseData) return;

      if (options.generateTf) {
        const tfJsonPath = path.resolve(
          typeof options.generateTf === 'string'
            ? options.generateTf
            : path.join(process.cwd(), 'cmi5-output', 'au_mapping.tf.json'),
        );
        generateTfJson(courseData, tfJsonPath);
      }

      if (options.applyAuMappings) {
        const endpoint = options.applyAuMappings;

        const jwt = process.env['JWT'];

        if (jwt) {
          console.log('📊  Generating AU mappings...');
          const auMappingService = new AuMappingService({
            baseUrl: endpoint,
            jwt,
          });
          auMappingService.resolveAllAus(courseData);
        } else {
          console.log('❌  No JWT was provided');
        }
      }
    });
}
