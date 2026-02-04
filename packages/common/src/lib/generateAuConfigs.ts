import { generateAuId, generateBlockId, sanitizeName } from './generateCmi5Xml';
import { CourseData } from './types/course';

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

export interface FsOperations {
  readFile: (path: string, encoding?: string) => Promise<string | Uint8Array>;
  writeFile: (path: string, content: string | Uint8Array, encoding?: string) => Promise<void>;
  deleteFolder: (path: string, options: { recursive: boolean; force: boolean }) => Promise<void>;
  copy: (src: string, dest: string, options: { recursive: boolean }) => Promise<void>;
  mkdir: (path: string, options: { recursive: boolean }) => Promise<void>;
}

// Copy and patch index.html & fav icon to AU folder
async function copyIndexFile(
  distPath: string,
  outputPath: string,
  fs: FsOperations,
  pathJoin: (...paths: string[]) => string,
  pathRelative: (from: string, to: string) => string,
): Promise<void> {
  const indexPath = pathJoin(distPath, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf-8') as string;
  const relativePath = pathRelative(outputPath, distPath);
  const modifiedContent = localizeNxBuildPathing(indexHtml, relativePath);

  await fs.writeFile(
    pathJoin(outputPath, 'index.html'),
    modifiedContent,
    'utf-8',
  );

  const cfgPath = pathJoin(distPath, 'cfg.json');
  const cfgJson = await fs.readFile(cfgPath, 'utf-8') as string;
  const modifiedCfg = localizeCfg(cfgJson, relativePath);

  await fs.writeFile(pathJoin(outputPath, 'cfg.json'), modifiedCfg, 'utf-8');

  const icoPath = pathJoin(distPath, 'favicon.ico');
  const ico = await fs.readFile(icoPath);
  await fs.writeFile(pathJoin(outputPath, 'favicon.ico'), ico);
}

export async function generateCourseDist(
  coursePath: string,
  distPath: string,
  courseData: CourseData,
  fs: FsOperations,
  pathJoin: (...paths: string[]) => string,
  pathRelative: (from: string, to: string) => string,
  outputBaseFolder?: string,
): Promise<void> {
  const outputPath = pathJoin(distPath, 'compiled_course', 'blocks');
  
  // Clean the previous output if any
  await fs.deleteFolder(outputPath, { recursive: true, force: true });
  
  const finalOutputPath = outputBaseFolder
    ? pathJoin(outputPath, outputBaseFolder)
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

  const uccJsonPath = pathJoin(distPath, 'UCC_Schema.json');

  await fs.writeFile(
    uccJsonPath,
    JSON.stringify(uccCourseFile, null, 2),
    'utf-8',
  );

  await fs.copy(coursePath, finalOutputPath, { recursive: true });

  // Process all AUs sequentially to avoid race conditions
  for (const block of courseData.blocks) {
    for (const au of block.aus) {
      const docsDirPath = au.dirPath
        ? au.dirPath
        : pathJoin(sanitizeName(block.blockName), sanitizeName(au.auName));
      const auPath = pathJoin(outputPath, docsDirPath);
      const auPathJson = pathJoin(auPath, 'config.json');

      await fs.mkdir(auPath, { recursive: true });

      await fs.writeFile(auPathJson, JSON.stringify(au, null, 2), 'utf-8');
      await copyIndexFile(distPath, auPath, fs, pathJoin, pathRelative);
    }
  }
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