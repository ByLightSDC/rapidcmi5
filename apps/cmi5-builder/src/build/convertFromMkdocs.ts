import path, { basename, dirname, join } from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import {
  cleanMkdocs,
  CourseAU,
  CourseBlock,
  CourseData,
  flattenFolders,
  FolderStruct,
  generateCourseJson,
  RC5_VERSION,
  SlideType,
} from '@rapid-cmi5/cmi5-build-common';

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
    throw Error(`${mkdocsFile.name} has no content`);
  }
  try {
    // This is not yaml parasable, needs to be removed
    const cleanedContent = mkdocsFile.content
      .toString()
      .replaceAll(
        'format: !!python/name:pymdownx.superfences.fence_code_format',
        '',
      );
    mkdocsConfig = yaml.load(cleanedContent);
  } catch (err) {
    console.error(`Failed to parse ${mkdocsFile.name}:`, err);
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

        const foundPath = flattenedStruct.find((node) =>
          node.id.endsWith(fullSlidePath),
        );

        if (!foundPath) {
          console.warn('Could not find slide:', fullSlidePath);
          continue;
        }

        const cleanedContent = cleanMkdocs(
          (foundPath?.content || '').toString(),
          path,
        );

        convertedFolderStructure.push({
          id: fullSlidePath,
          isBranch: false,
          name: basename(path),
          content: cleanedContent,
        } as FolderStruct);

        const slide: SlideType = {
          filepath: fullSlidePath,
          slideTitle: title,
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
      const foundPath = flattenedStruct.find((node) =>
        node.id.endsWith(filePath),
      );

      if (!foundPath) {
        console.warn('Could not find slide:', filePath);
        continue;
      }

      au.dirPath = dirname(filePath);

      const cleanedContent = cleanMkdocs(
        (foundPath?.content || '').toString(),
        filePath,
      );

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

export async function convertFromMkdocs(
  outputPath: string,
  folderStructure: FolderStruct[],
): Promise<{ courseData: CourseData; docsDir: string }> {
  const mkdocsFile = folderStructure.find(
    (node) => node.name === 'mkdocs.yaml' || node.name === 'mkdocs.yml',
  );
  if (!mkdocsFile) {
    throw new Error('mkdocs.yaml or mkdocs.yml not found in the course folder');
  }

  const mkdocsConfig = await getMkdocsFile(mkdocsFile);

  const docsDir = mkdocsConfig.docs_dir ?? 'docs';
  const courseId = mkdocsConfig.repo_url ?? 'https://ros/mkdocs';
  const courseTitle = mkdocsConfig.site_name ?? 'MKDOCS Course';
  const navObject = await getNavObject(mkdocsConfig);

  const { convertedFolderStructure, rc5File } =
    await getConvertedFolderStructure(
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
