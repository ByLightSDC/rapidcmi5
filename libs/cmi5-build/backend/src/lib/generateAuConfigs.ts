import { CourseData } from '@rapid-cmi5/types/cmi5';
import fs from 'fs';
import path from 'path';
import { generateAuId, generateBlockId, sanitizeName } from './generateCmi5Xml';

// Utility to localize NX build pathing in index.html
function localizeNxBuildPathing(content: string, relativePath: string): string {
  return content
    .replace(/"runtime\./g, `"${relativePath}/runtime.`)
    .replace(/"styles\./g, `"${relativePath}/styles.`)
    .replace(/"main\./g, `"${relativePath}/main.`)
    .replace('<base href="/">', '');
}

function localizeCfg(content: string, relativePath: string): string {
  return content.replaceAll('./', relativePath + '/');
}

// Copy and patch index.html & fav icon to AU folder
function copyIndexFile(distPath: string, outputPath: string): void {
  const indexPath = path.join(distPath, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  const relativePath = path.relative(outputPath, distPath);
  const modifiedContent = localizeNxBuildPathing(indexHtml, relativePath);

  fs.writeFileSync(
    path.join(outputPath, 'index.html'),
    modifiedContent,
    'utf-8',
  );

  const cfgPath = path.join(distPath, 'cfg.json');
  const cfgJson = fs.readFileSync(cfgPath, 'utf-8');
  const modifiedCfg = localizeCfg(cfgJson, relativePath);

  fs.writeFileSync(path.join(outputPath, 'cfg.json'), modifiedCfg, 'utf-8');

  const icoPath = path.join(distPath, 'favicon.ico');
  const ico = fs.readFileSync(icoPath);
  fs.writeFileSync(path.join(outputPath, 'favicon.ico'), ico);
}

export async function generateCourseDist(
  coursePath: string,
  distPath: string,
  courseData: CourseData,
  outputBaseFolder?: string,
): Promise<void> {
  const outputPath = path.join(distPath, 'compiled_course', 'blocks');
  // Clean the previous output if any
  await fs.promises.rm(outputPath, { recursive: true, force: true });
  const finalOutputPath = outputBaseFolder
    ? path.join(outputPath, outputBaseFolder)
    : outputPath;

  const uccCourseFile = {
    aus: courseData.blocks.flatMap((block) =>
      block.aus.map((au) => {
        const blockId = generateBlockId({
          courseId: courseData.courseId,
          blockName: block.blockName,
        });

        const auId = generateAuId({ blockId: blockId, auName: au.auName });
        return {
          id: auId,
          competencies: {
            teaches: [],
            assesses: [],
          },
          details: {
            duration: 1,
            path: 'modules/scenarios/init',
            type: 'lab',
            version: '1.0.0',
          },
        } as UccAU;
      }),
    ),
    competencies: {
      teaches: [],
      assesses: [],
    },
    details: {
      banner: './assets/ccoe/slide_title_blk.png',
      code: 'course-init',
      description: courseData.courseDescription,
      logo: './assets/ccoe/ccoe.png',
      providerId: 'https://rapidcmi5.com',
      title: courseData.courseTitle,
      version: '1.0.0',
    },
    id: courseData.courseId,
  } as UccCourse;

  const uccJsonPath = path.join(distPath, 'UCC_Schema.json');

  fs.writeFileSync(
    uccJsonPath,
    JSON.stringify(uccCourseFile, null, 2),
    'utf-8',
  );

  await fs.promises.cp(coursePath, finalOutputPath, { recursive: true });

  courseData.blocks.forEach((block) => {
    block.aus.forEach((au) => {
      const docsDirPath = au.dirPath
        ? path.join(au.dirPath)
        : path.join(sanitizeName(block.blockName), sanitizeName(au.auName));
      const auPath = path.join(outputPath, docsDirPath);
      const auPathJson = path.join(auPath, 'config.json');

      fs.mkdirSync(auPath, { recursive: true });

      const backgroundImage = au.backgroundImage;
      const hasScenario = !!au.rangeosScenarioName;

      fs.writeFileSync(auPathJson, JSON.stringify(au, null, 2), 'utf-8');
      copyIndexFile(distPath, auPath);
    });
  });
}

interface UccCourseDetails {
  code: string;
  version: string;
  providerId: string;
  logo: string;
  banner: string;
  title: string;
  description: string;
}

interface UccAUDetails {
  type: string;
  version: string;
  duration: number;
  path: string;
}

interface UccCompetencies {
  teaches: string[];
  assesses: string[];
}

interface UccAU {
  id: string;
  details: UccAUDetails;
  competencies: UccCompetencies;
}

interface UccCourse {
  id: string;
  details: UccCourseDetails;
  competencies: UccCompetencies;
  aus: UccAU[];
}
