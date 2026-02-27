import fs from 'fs';
import archiver from 'archiver';
import { app } from 'electron';

import {
  FolderStruct,
  FsOperations,
  generateCmi5Xml,
  generateCourseDist,
  generateCourseJson,
} from '@rapid-cmi5/cmi5-build-common';
import { join as joinPosix, relative as relativePosix } from 'path/posix';
import path from 'path';

export function getAssetPath(...segments: string[]) {
  if (!app.isPackaged) {
    return path.join(__dirname, 'assets', ...segments);
  }
  return path.join(process.resourcesPath, 'assets', ...segments);
}

const fsOps: FsOperations = {
  readFile: async (path: string, encoding?: string) => {
    const content = await fs.promises.readFile(path);
    if (encoding === 'utf-8') {
      return new TextDecoder().decode(content as Uint8Array);
    }
    return content;
  },
  writeFile: async (path: string, content: string | Uint8Array, encoding?: string) => {
    await fs.promises.writeFile(path, content);
  },
  deleteFolder: async (path: string, options: { recursive: boolean; force: boolean }) => {
    try {
      await fs.promises.rm(path, options);
    } catch (err) {
      if (!options.force) throw err;
    }
  },
  copy: async (src: string, dest: string, options: { recursive: boolean }) => {
    await fs.promises.cp(src, dest, { recursive: true });
  },
  mkdir: async (path: string, options: { recursive: boolean }) => {
    await fs.promises.mkdir(path, options);
  },
};

export class cmi5Builder {
  public async buildZip(
    coursePath: string,
    folderStructure: FolderStruct[],
    projectName: string,
    courseFolder: string,
  ): Promise<string | null> {
    const buildPath = path.join(process.cwd(), '/cmi5/output', `${projectName}_${Date.now()}`);
    const outPath = path.join(process.cwd(), 'build-output', projectName);

    // We always want to cleanup the folders, on any kind of failure

    try {
      const distPath = getAssetPath('cc-cmi5-player-dist');

      await fs.promises.cp(distPath, buildPath, { recursive: true });

      const courseData = generateCourseJson(folderStructure);

      if (!courseData) {
        throw new Error('Course data was null');
      }

      await generateCourseDist(coursePath, buildPath, courseData, fsOps, joinPosix, relativePosix, courseFolder);

      const cmi5Xml = generateCmi5Xml(courseData);
      const cmi5Path = path.join(buildPath, 'cmi5.xml');

      await fs.promises.writeFile(cmi5Path, cmi5Xml.trim(), 'utf-8');

      try {
        const archive = archiver('zip', { zlib: { level: 9 } });

        await fs.promises.mkdir(path.dirname(outPath), {
          recursive: true,
        });

        const output = fs.createWriteStream(outPath);
        archive.pipe(output);

        archive.directory(buildPath, false);

        archive.on('warning', function (err: any) {
          if (err.code === 'ENOENT') {
            console.warn('Warning ', err);
          } else {
            throw err;
          }
        });

        archive.on('error', function (err: any) {
          throw err;
        });

        await archive.finalize();
        return outPath;
      } catch (err: any) {
        console.error('Failed to return archive', err);
        throw err;
      }
    } finally {
      // Cleanup the files
      try {
        await fs.promises.rm(buildPath, { recursive: true, force: true });
      } catch (err) {
        console.warn('Failed to remove build path', err);
      }
    }
  }
}
