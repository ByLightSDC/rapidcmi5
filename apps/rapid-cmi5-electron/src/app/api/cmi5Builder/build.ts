import path from 'path';
import fs from 'fs';
import extract from 'extract-zip';
import archiver from 'archiver';
import { app } from 'electron';

import {
  generateCourseDist,
  generateCmi5Xml,
  getFolderStructureBackend,
} from '@rapid-cmi5/cmi5-build/backend';

import { generateCourseJson } from '@rapid-cmi5/cmi5-build-common';

function getAssetPath(...segments: string[]) {
  if (!app.isPackaged) {
    return path.join(__dirname, 'assets', ...segments);
  }
  return path.join(process.resourcesPath, 'assets', ...segments);
}

export class cmi5Builder {
  public async buildZip(
    buf: Buffer,
    projectName: string,
  ): Promise<string | null> {

    await fs.promises.writeFile(path.join(process.cwd(), projectName), buf);

    const file = {
      path: path.join(process.cwd(), projectName),
      originalname: projectName,
    };

    const extractedPath = await this.extractZip(file.path, file.originalname);
    const buildPath = path.join(
      process.cwd(),
      '/cmi5/output',
      `${projectName}_${Date.now()}`,
    );
    // We always want to cleanup the folders, on any kind of failure
    try {
      const distPath = getAssetPath('cc-cmi5-player-dist');

      await fs.promises.cp(distPath, buildPath, { recursive: true });

      const folderStructure = await getFolderStructureBackend(extractedPath);
      const courseFolder = folderStructure[0].children;
      if (!courseFolder) return null;
      const courseData = generateCourseJson(courseFolder);

      if (!courseData) {
        throw new Error('Course data was null');
      }

      await generateCourseDist(extractedPath, buildPath, courseData);

      const cmi5Xml = generateCmi5Xml(courseData);
      const cmi5Path = path.join(buildPath, 'cmi5.xml');

      await fs.promises.writeFile(cmi5Path, cmi5Xml.trim(), 'utf-8');

      try {
        const archive = archiver('zip', { zlib: { level: 9 } });

        const outPath = path.join(process.cwd(), 'build-output', projectName);
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
        await fs.promises.unlink(file.path);
      } catch (err) {
        console.warn('Failed to delete uploaded file', err);
      }
      try {
        await fs.promises.rm(extractedPath, { recursive: true, force: true });
      } catch (err) {
        console.warn('Failed to remove extracted path', err);
      }
      try {
        await fs.promises.rm(buildPath, { recursive: true, force: true });
      } catch (err) {
        console.warn('Failed to remove build path', err);
      }
    }
  }

  async extractZip(filePath: string, fileName: string): Promise<string> {
    const outputPath = `${process.cwd()}/uploads/${fileName}_${Date.now()}`;
    fs.mkdirSync(outputPath, { recursive: true });
    await extract(filePath, { dir: outputPath });
    return outputPath;
  }

  validateZipFile() {}
}
