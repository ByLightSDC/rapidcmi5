#!/usr/bin/env node

import { Command } from 'commander';
import path, { basename, dirname, join, relative } from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';

import AdmZip from 'adm-zip';
import { generateAllAuMappings } from './commands/generateAuMappings';
import { AuMappingService } from './services/auMappingService';
import {
  CourseAU,
  CourseBlock,
  CourseData,
  FsOperations,
  generateCmi5Xml,
  generateCourseDist,
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContent,
  SlideType,
  SlideTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

import YAML from 'yaml';
import 'dotenv/config';
import { OpendashUploadService } from './services/openDash/opendashUploadService';
import { MoodleUploadService } from './services/moodle/moodleUploadService';
import {
  cleanMkdocs,
  flattenFolders,
  FolderStruct,
  generateCourseJson,
  RC5_VERSION,
} from '@rapid-cmi5/cmi5-build-common';
import { getFolderStructureBackend } from './fileSystem/fileSystem';

export interface CourseMeta {
  courseName?: string;
  courseDescription?: string;
  courseBaseId?: string;
  // Mostly for opendash, puts a quiz in the last AU that the user must type in "Complete"
  // This prevents a student from finishing a cmi5 course before they are ready.
  completionExam?: boolean;
  scenarioOverride?: {
    uuid?: string;
    name?: string;
    introTitle?: string;
    introContent?: string;
    promptClassId?: boolean;
  };
}
const program = new Command();

program
  .name('cmi5-builder')
  .description('Generate cmi5 content from an mkdocs repo and upload to opendash')
  .version('1.0.0');

program
  .command('generate-au-terraform')
  .description('Generate au -> scenario terraform mappings for multiple courses')
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

        const folderStructure = await getFolderStructureBackend(courseFolderPath);
        const courseData = generateCourseJson(folderStructure);

        if (courseData) {
          courses.push(courseData);
        }
      }
    }
    generateAllTfJson(courses, tfJsonPath);
  });

program
  .command('build')
  .description('Generate cmi5 content from a course directory')
  .argument('<coursePath>', 'Path to the course folder, should contain an mkdocs file')
  .argument('<distPath>', 'Path to the cmi5 player dist folder')
  .option('--generate-tf [path]', 'Create a tf.json file for the course AU mappings (optional output path)')
  .option('--zip [path]', 'Create a ZIP of the output directory')
  .option('--apply-au-mappings <endpoint>', 'Create AU mappings (AU ID -> Scenario) at endpoint')
  .option('--course-meta <yamlPath>', 'Path to optional YAML file to override course metadata')
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

    const courseData = await buildCmi5(inputPath, outputPath, overrideData, options.convert);

    if (options.zip) {
      const zipPath = path.resolve(
        typeof options.zip === 'string' ? options.zip : path.join(process.cwd(), 'cmi5-output', 'cmi5.zip'),
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

program
  .command('build-opendash')
  .description('Build and upload course content to OpenDash and create AU mappings')
  .argument('<coursePath>', 'Path to the course folder')
  .argument('<distPath>', 'Path to the output dist folder')
  .argument('<endpoint>', 'opendash endpoint')
  .option(
    '--apply-au-mappings <endpoint>',
    'Create AU mappings Specific to Opendash Format (AU ID -> Scenario) at endpoint',
  )
  .option('--course-meta <yamlPath>', 'Path to optional YAML file to override course metadata')
  .option('--use-real-auid', 'For newer versions of opendash you may use the auid instead of the random uuid generated')
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
    const courseData = await buildCmi5(inputPath, outputPath, overrideData, options.convert);

    if (courseData === null) return;

    const zipPath = path.resolve(
      typeof options.zip === 'string' ? options.zip : path.join(process.cwd(), 'cmi5-output', 'cmi5.zip'),
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
      await uploader.uploadCourse(courseData, auMappingService, zipPath, options.applyAuMappings);
    } else {
      console.log(
        `❌  No JWT was provided for either opendash ${jwtOpendash ? 'true' : false} or ros ${jwtDevopsApi ? 'true' : 'false'}`,
      );
    }
  });
program
  .command('build-moodle')
  .description('Build and upload course content to Moodle and create AU mappings')
  .argument('<coursePath>', 'Path to the course folder')
  .argument('<distPath>', 'Path to the output dist folder')
  .argument('<endpoint>', 'moodle endpoint')
  .option(
    '--apply-au-mappings <endpoint>',
    'Create AU mappings Specific to Opendash Format (AU ID -> Scenario) at endpoint',
  )
  .option('--course-meta <yamlPath>', 'Path to optional YAML file to override course metadata')
  .option('--zip <path>', 'Create a ZIP of the output directory')
  .option('--moodle-course-name <name>', 'The Moodle course fullname')
  .option('--moodle-course-id <id>', 'The Moodle course id')
  .option('--moodle-section-id <id>', 'The Moodle course section id')
  .option('--convert', 'convert from mkdocs')

  .action(async (coursePath, distPath, endpoint, options) => {
    console.log(`Uploading to moodle at ${endpoint}...`);

    const hasName = !!options.moodleCourseName;
    const hasId = !!options.moodleCourseId;

    if (hasName && hasId) {
      console.error('❌ Please provide either --moodle-course-name or --moodle-course-id, not both.');
      process.exit(1);
    }

    if (!hasName && !hasId) {
      console.error('❌ You must provide either --moodle-course-name or --moodle-course-id.');
      process.exit(1);
    }

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
    const courseData = await buildCmi5(inputPath, outputPath, overrideData, options.convert);

    if (courseData === null) return;

    const zipPath = path.resolve(
      typeof options.zip === 'string' ? options.zip : path.join(process.cwd(), 'cmi5-output', 'cmi5.zip'),
    );

    zipCmi5(outputPath, zipPath);

    const jwtDevopsApi = process.env['JWT_DEVOPS_API'];
    const moodleWsToken = process.env['MOODLE_WS_TOKEN'];

    if (jwtDevopsApi && moodleWsToken) {
      console.log('📊  Uploading zip to moodle...');
      const mappingEndpoint = options.applyAuMappings;

      const auMappingService = new AuMappingService({
        baseUrl: mappingEndpoint,
        jwt: jwtDevopsApi,
      });

      const uploader = new MoodleUploadService({
        baseUrl: endpoint,
        wstoken: moodleWsToken,
      });

      await uploader.uploadCourse(
        courseData,
        auMappingService,
        zipPath,
        options.applyAuMappings,
        options.moodleSectionId,
        options.moodleCourseId,
        options.moodleCourseName,
      );
    } else {
      console.log(
        `❌  No TOKEN was provided for moodleWsToken ${moodleWsToken ? 'true' : 'false'} or ros ${jwtDevopsApi ? 'true' : 'false'}`,
      );
    }
  });

program.parse(process.argv);

async function buildCmi5(inputPath: string, outputPath: string, overrideData?: CourseMeta, convert: boolean = false) {
  console.log('📁  Course path:', inputPath);
  console.log('▶️  Dist path (Built CMI5 Player):', outputPath);

  const folderStructure = await getFolderStructureBackend(inputPath);
  let courseData;
  let distFolderName;
  let distFolderPath;

  if (convert) {
    const convertedData = await convertFromMkdocs(outputPath, folderStructure);
    if (!convertedData) {
      console.error('❌ Course data was null');
      return null;
    }
    distFolderName = convertedData.docsDir;
    distFolderPath = join(inputPath, distFolderName);
    courseData = convertedData.courseData;
  } else {
    distFolderName = basename(inputPath);
    distFolderPath = inputPath;
    courseData = generateCourseJson(folderStructure);
  }

  if (!courseData) {
    console.error('❌ Course data was null');
    return null;
  }

  if (overrideData) {
    courseData = applyOverrides(courseData, overrideData);
  }

  const fsOps: FsOperations = {
    readFile: async (path: string, encoding?: string) => {
      const content = await fs.readFile(path);
      if (encoding === 'utf-8') {
        return new TextDecoder().decode(content as Uint8Array);
      }
      return content;
    },
    writeFile: async (path: string, content: string | Uint8Array, encoding?: string) => {
      await fs.writeFile(path, content);
    },
    deleteFolder: async (path: string, options: { recursive: boolean; force: boolean }) => {
      try {
        await fs.rm(path, options);
      } catch (err) {
        if (!options.force) throw err;
      }
    },
    copy: async (src: string, dest: string, options: { recursive: boolean }) => {
      await fs.cp(src, dest, {recursive: true});
    },
    mkdir: async (path: string, options: { recursive: boolean }) => {
      await fs.mkdir(path, options);
    },
  };
  await generateCourseDist(distFolderPath, outputPath, courseData, fsOps, join, relative, distFolderName);

  const cmi5Xml = generateCmi5Xml(courseData);
  const cmi5Path = path.join(outputPath, 'cmi5.xml');
  await fs.writeFile(cmi5Path, cmi5Xml.trim());

  console.log('✅ cmi5.xml generated at:', cmi5Path);

  return courseData;
}

function applyOverrides(course: CourseData, o: CourseMeta): CourseData {
  const courseTitle = o.courseName ?? course.courseTitle;
  const courseId = o.courseBaseId ?? course.courseId;
  const courseDescription = o.courseDescription ?? course.courseDescription;

  const nextBlocks = (course.blocks ?? []).map((block) => {
    const blockName = o.courseName ?? block.blockName ?? courseTitle;
    const blockDescription = o.courseDescription ?? block.blockDescription ?? courseDescription;

    const nextAus = (block.aus ?? []).map((au) => {
      const rangeosScenarioName = o.scenarioOverride?.name ?? au.rangeosScenarioName;
      const rangeosScenarioUUID = o.scenarioOverride?.uuid ?? au.rangeosScenarioUUID;
      const promptClassId = o.scenarioOverride?.promptClassId ?? au.promptClassId;

      const scenarioSlide = makeScenarioSlide({
        uuid: rangeosScenarioUUID,
        name: rangeosScenarioName,
        promptClassId,
      });

      // Idempotently ensure the scenario slide is first
      const slides = ensureScenarioFirst(au.slides ?? [], scenarioSlide);

      return {
        ...au,
        rangeosScenarioName,
        rangeosScenarioUUID,
        promptClassId,
        slides,
      };
    });

    return {
      ...block,
      blockName,
      blockDescription,
      aus: nextAus,
    };
  });

  let nextCourse: CourseData = {
    ...course,
    courseTitle,
    courseId,
    courseDescription,
    blocks: nextBlocks,
  };

  if (o.completionExam) {
    nextCourse = ensureCompletionExam(nextCourse);
  }

  return nextCourse;
}

/** ---------- helpers ---------- */

function makeScenarioSlide(args: { uuid?: string; name?: string; promptClassId?: boolean }): SlideType {
  const promptClass = typeof args.promptClassId === 'number' ? args.promptClassId : false;

  const payload = {
    uuid: args.uuid ?? '',
    name: args.name ?? '',
    promptClass,
  };

  return {
    type: SlideTypeEnum.Markdown,
    slideTitle: 'Lab',
    content: [':::scenario', '```json', JSON.stringify(payload, null, 2), '```', ':::'].join('\n'),
    filepath: '',
  };
}

function isScenarioSlide(slide?: SlideType): boolean {
  return (
    slide?.type === SlideTypeEnum.Markdown && typeof slide.content === 'string' && slide.content.includes(':::scenario')
  );
}

function ensureScenarioFirst(slides: SlideType[], scenario: SlideType): SlideType[] {
  if (slides.length === 0) return [scenario];
  if (isScenarioSlide(slides[0])) return slides; // already first → idempotent
  // remove any existing scenario slide elsewhere to avoid duplicates
  const filtered = slides.filter((s) => !isScenarioSlide(s));
  return [scenario, ...filtered];
}

function ensureCompletionExam(course: CourseData): CourseData {
  const blocks = course.blocks ?? [];
  if (blocks.length === 0) return course;

  const lastBlockIndex = blocks.length - 1;
  const lastBlock = blocks[lastBlockIndex];
  const aus = lastBlock.aus ?? [];
  if (aus.length === 0) return course;

  const lastAuIndex = aus.length - 1;
  const lastAu = aus[lastAuIndex];
  const slides = lastAu.slides ?? [];

  // prevent duplicate completion slides
  const hasCompletion = slides.some(
    (s) =>
      s.type === SlideTypeEnum.Markdown &&
      typeof s.content === 'string' &&
      s.content.includes(':::quiz') &&
      s.content.includes('"cmi5QuizId": "course-completion"'),
  );
  if (hasCompletion) return course;

  const completionQuestion: QuizContent = {
    cmi5QuizId: 'course-completion',
    completionRequired: QuizCompletionEnum.Passed,
    passingScore: 100,
    questions: [
      {
        question: 'Type in : "Complete" in order to finish the exam.',
        type: QuestionResponse.FreeResponse,
        typeAttributes: {
          correctAnswer: 'Complete',
          grading: QuestionGrading.Exact,
        },
        cmi5QuestionId: 'course-complete',
      },
    ],
  };

  const completionSlide: SlideType = {
    type: SlideTypeEnum.Markdown,
    slideTitle: 'Course Completion Acknowledgement',
    content: [':::quiz', '```json', JSON.stringify(completionQuestion, null, 2), '```', ':::'].join('\n'),
    filepath: '',
  };

  const nextAu = { ...lastAu, slides: [...slides, completionSlide] };
  const nextAus = [...aus.slice(0, lastAuIndex), nextAu, ...aus.slice(lastAuIndex + 1)];
  const nextBlock = { ...lastBlock, aus: nextAus };
  const nextBlocks = [...blocks.slice(0, lastBlockIndex), nextBlock, ...blocks.slice(lastBlockIndex + 1)];

  return { ...course, blocks: nextBlocks };
}

function zipCmi5(cmi5CoursePath: string, zipPath: string) {
  const zip = new AdmZip();
  zip.addLocalFolder(cmi5CoursePath);
  zip.writeZip(zipPath);
  console.log('📦 Zipped output to: ', zipPath);
  return zipPath;
}

async function generateTfJson(courseData: CourseData, tfJsonPath: string) {
  console.log('🧱 Generating Terraform JSON AU mapping file...');

  const tfJson = generateAllAuMappings([courseData]);

  const tfOutputDir = path.dirname(tfJsonPath);
  await fs.mkdir(tfOutputDir, { recursive: true });
  await fs.writeFile(tfJsonPath, JSON.stringify(tfJson, null, 2));

  console.log('✅ Terraform AU mapping file written to:', tfJsonPath);
}

async function generateAllTfJson(coursesData: CourseData[], tfJsonPath: string) {
  console.log('🧱 Generating Terraform JSON AU mapping file...');

  const tfJson = generateAllAuMappings(coursesData);

  const tfOutputDir = path.dirname(tfJsonPath);
  await fs.mkdir(tfOutputDir, { recursive: true });
  await fs.writeFile(tfJsonPath, JSON.stringify(tfJson, null, 2));

  console.log('✅ Terraform AU mapping file written to:', tfJsonPath);
}

type leafNode = {
  title: string;
  path: string;
  lesson: string;
};

function getLeafNodes(parentNode: Array<Record<string, any>>, prevKey = '') {
  let nodes: Array<leafNode> = []; // create an empty "Record"

  if (Array.isArray(parentNode)) {
    for (const cnode of parentNode) {
      for (const [key, value] of Object.entries(cnode)) {
        if (typeof value === 'string') {
          nodes.push({ path: value, title: key, lesson: prevKey } as leafNode); // add directly
        } else {
          nodes = [...nodes, ...getLeafNodes(value, key)]; // merge results
        }
      }
    }
  }

  return nodes;
}

async function getMkdocsFile(mkdocsFile: FolderStruct) {
  let mkdocsConfig: any;
  if (!mkdocsFile.content) {
    throw Error('No mkdocs.yaml file content');
  }
  try {
    // This is not yaml parasable, needs to be removed
    const cleanedContent = mkdocsFile.content
      .toString()
      .replaceAll('format: !!python/name:pymdownx.superfences.fence_code_format', '');
    mkdocsConfig = yaml.load(cleanedContent);
  } catch (err) {
    console.error('Failed to parse mkdocs.yaml:', err);
    throw err;
  }

  return mkdocsConfig;
}

async function getNavObject(mkdocsConfig: any) {
  let navObject: Record<string, string | Record<string, any>[]> | undefined;
  if (Array.isArray(mkdocsConfig.nav)) {
    navObject = {};
    for (const item of mkdocsConfig.nav) {
      Object.assign(navObject, item);
    }
  }

  if (!navObject) {
    throw new Error('No nav object was found, aborting conversion');
  }

  return navObject;
}

async function getConvertedFolderStructure(
  folderStructure: FolderStruct[],
  courseTitle: string,
  courseId: string,
  docsDir: string,
  navObject: Record<string, string | Record<string, any>[]>,
) {
  const convertedFolderStructure: FolderStruct[] = [];

  const flattenedStruct = flattenFolders(folderStructure);

  const rc5File: CourseData = {
    blocks: [
      {
        aus: [],
        blockName: courseTitle,
      } as CourseBlock,
    ],
    courseId: courseId,
    courseTitle: courseTitle,
    rc5Version: RC5_VERSION,
  };

  const aus = rc5File.blocks[0].aus;

  for (const [lesson, value] of Object.entries(navObject)) {
    if (Array.isArray(value)) {
      const leafNodes = getLeafNodes(value, lesson);

      for (const leafNode of leafNodes) {
        const { lesson, path, title } = leafNode;

        let au = aus.find((au) => au.auName === lesson);

        if (!au) {
          au = {
            auName: lesson,
            dirPath: join(docsDir, lesson),
            slides: [],
          } as CourseAU;
          aus.push(au);
        }

        const fullSlidePath = join(docsDir, path);

        au.dirPath = dirname(fullSlidePath);

        const foundPath = flattenedStruct.find((node) => node.id.endsWith(fullSlidePath));

        if (!foundPath) {
          console.warn('Could not find slide:', fullSlidePath);
          continue;
        }

        const cleanedContent = cleanMkdocs((foundPath?.content || '').toString(), path);

        convertedFolderStructure.push({
          id: fullSlidePath,
          isBranch: false,
          name: basename(path),
          content: cleanedContent,
        } as FolderStruct);

        const slide: SlideType = {
          filepath: fullSlidePath,
          slideTitle: title,
          type: SlideTypeEnum.Markdown,
          content: '',
        };

        au.slides.push(slide);
      }
    } else if (typeof value === 'string') {
      let au = aus.find((au) => au.auName === courseTitle);

      if (!au) {
        au = {
          auName: courseTitle,
          dirPath: docsDir,
          slides: [],
        } as CourseAU;
        aus.push(au);
      }

      const filePath = join(docsDir, value);
      const foundPath = flattenedStruct.find((node) => node.id.endsWith(filePath));

      if (!foundPath) {
        console.warn('Could not find slide:', filePath);
        continue;
      }

      au.dirPath = dirname(filePath);

      const cleanedContent = cleanMkdocs((foundPath?.content || '').toString(), filePath);

      const fullPath = join(docsDir, basename(value));

      convertedFolderStructure.push({
        id: fullPath,
        isBranch: false,
        name: basename(value),
        content: cleanedContent,
      } as FolderStruct);

      const slide: SlideType = {
        filepath: fullPath,
        slideTitle: lesson,
        type: SlideTypeEnum.Markdown,
        content: '',
      };

      au.slides.push(slide);
    }
  }

  convertedFolderStructure.push({
    id: 'RC5.yaml',
    name: 'RC5.yaml',
    isBranch: false,
    content: JSON.stringify(rc5File),
  } as FolderStruct);

  return { convertedFolderStructure, rc5File };
}

async function convertFromMkdocs(
  outputPath: string,
  folderStructure: FolderStruct[],
): Promise<{ courseData: CourseData; docsDir: string }> {
  folderStructure.find((node) => node.name === 'mkdocs.yaml');
  const mkdocsFile = folderStructure.find((node) => node.name === 'mkdocs.yaml');
  if (!mkdocsFile) {
    throw new Error('mkdocs.yaml not found or missing content');
  }

  const mkdocsConfig = await getMkdocsFile(mkdocsFile);

  const docsDir = mkdocsConfig.docs_dir ?? 'docs';
  const courseId = mkdocsConfig.repo_url ?? 'https://ros/mkdocs';
  const courseTitle = mkdocsConfig.site_name ?? 'MKDOCS Course';
  const navObject = await getNavObject(mkdocsConfig);

  const { convertedFolderStructure, rc5File } = await getConvertedFolderStructure(
    folderStructure,
    courseTitle,
    courseId,
    docsDir,
    navObject,
  );

  if (!convertedFolderStructure) {
    console.error('❌ Failed to load override file:');
    process.exit(1);
  }

  const courseData = generateCourseJson(convertedFolderStructure);

  if (!courseData) {
    console.error('❌ Course data was null');
    process.exit(1);
  }

  const parentPath = join(outputPath, 'compiled_course', 'blocks');
  const rc5Path = join(parentPath, 'RC5.yaml');
  await fs.mkdir(parentPath, { recursive: true });

  await fs.writeFile(rc5Path, JSON.stringify(rc5File, null, 2), {});

  return { courseData, docsDir };
}
