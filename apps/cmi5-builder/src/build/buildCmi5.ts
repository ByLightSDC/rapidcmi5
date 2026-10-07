import path, { basename, join, relative } from 'path';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import {
  FsOperations,
  generateCmi5Xml,
  generateCourseDist,
  generateCourseJson,
} from '@rapid-cmi5/cmi5-build-common';
import { getFolderStructureBackend } from '../fileSystem/fileSystem';
import { applyOverrides, CourseMeta } from './courseOverrides';
import { convertFromMkdocs } from './convertFromMkdocs';

export async function buildCmi5(
  inputPath: string,
  outputPath: string,
  overrideData?: CourseMeta,
  convert = false,
) {
  console.log('📁  Course path:', inputPath);
  console.log('▶️  Dist path (Built CMI5 Player):', outputPath);

  let inputStats;
  try {
    inputStats = await fs.stat(inputPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Course directory does not exist: ${inputPath}`);
    }
    throw error;
  }
  if (!inputStats.isDirectory()) {
    throw new Error(`Course path is not a directory: ${inputPath}`);
  }

  const folderStructure = await getFolderStructureBackend(inputPath);
  let courseData;
  let distFolderName;
  let distFolderPath;
  let stagingPath: string | undefined;

  try {
    if (convert) {
      stagingPath = await fs.mkdtemp(join(tmpdir(), 'cmi5-mkdocs-'));
      courseData = await convertFromMkdocs(
        inputPath,
        folderStructure,
        stagingPath,
      );
      distFolderPath = stagingPath;
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
      writeFile: async (
        path: string,
        content: string | Uint8Array,
        encoding?: string,
      ) => {
        await fs.writeFile(path, content);
      },
      deleteFolder: async (
        path: string,
        options: { recursive: boolean; force: boolean },
      ) => {
        try {
          await fs.rm(path, options);
        } catch (err) {
          if (!options.force) throw err;
        }
      },
      copy: async (
        src: string,
        dest: string,
        options: { recursive: boolean },
      ) => {
        await fs.cp(src, dest, { recursive: true });
      },
      mkdir: async (path: string, options: { recursive: boolean }) => {
        await fs.mkdir(path, options);
      },
    };
    await generateCourseDist(
      distFolderPath,
      outputPath,
      courseData,
      fsOps,
      join,
      relative,
      distFolderName,
    );

    const cmi5Xml = generateCmi5Xml(courseData);
    const cmi5Path = path.join(outputPath, 'cmi5.xml');
    await fs.writeFile(cmi5Path, cmi5Xml.trim());

    console.log('✅ cmi5.xml generated at:', cmi5Path);

    return courseData;
  } finally {
    if (stagingPath) {
      await fs.rm(stagingPath, { recursive: true, force: true });
    }
  }
}
