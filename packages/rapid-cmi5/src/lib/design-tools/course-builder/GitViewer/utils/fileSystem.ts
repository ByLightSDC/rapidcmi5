import {
  FolderStruct,
  generateCourseJson,
  RC5_FILENAME,
  generateCourseDist,
  FsOperations,
  generateCmi5Xml,
  DirMeta,
  sortProjectMetas,
} from '@rapid-cmi5/cmi5-build-common';
import JSZip from 'jszip';
import path, { basename, dirname, join, relative } from 'path-browserify';
import { configure, fs as zenFs } from '@zenfs/core';
import { IndexedDB, WebAccess } from '@zenfs/dom';
import { fsType, RepoAccessObject } from '../../../../redux/repoManagerReducer';
import { set, get, keys, getMany, del } from 'idb-keyval';
import { debugLog, debugLogError } from '@rapid-cmi5/ui';
import { electronFs } from './ElectronFsApi';
import { IFs } from 'memfs';
import saveAs from 'file-saver';
import {
  getRc5Content,
  isExcludedAuFile,
  resolveCourseZipPaths,
  updateCourseData,
} from './courseImport';

export const getRepoPath = (r: RepoAccessObject) =>
  `/${r.fileSystemType}/${r.repoName}`;

export type FileSystemObject = typeof zenFs | typeof electronFs | IFs;

export const cmi5BuildCache = `/gitfs/cmi5-player`;
export const cmi5BuildOutput = `/gitfs/outPut`;

// Update the FolderStruct type to include modification time
// You'll need to add this to your @rapid-cmi5/cmi5-build-common package
// or create a local extended type:

export type FolderStructWithMtime = FolderStruct & {
  mtime?: number; // milliseconds since epoch
  mtimeDate?: string; // ISO string
};

const noGitInProjectError =
  'The selected directory does not contain a .git folder. Please choose a valid rapid cmi5 project';

export class GitFS {
  public fs: FileSystemObject;

  public isBrowserFsLoaded: boolean = false;
  public isLocalFsLoaded: boolean = false;
  public isMountStarted: boolean = false;
  public isElectron: boolean = false;
  public cache = {};
  // This allows us to remove a recent project from the recents list
  // If we delete it in the UI
  public currentProjectRecentsId?: string = undefined;

  constructor(isElectron: boolean = false) {
    if (isElectron) {
      this.fs = electronFs;
      this.isElectron = true;
    } else {
      this.fs = zenFs;
      this.isElectron = false;
    }
  }
  init = async () => {
    if (this.isElectron) {
      this.isMountStarted = true;
      this.isBrowserFsLoaded = true;
      return;
    }
    if (this.isMountStarted) return;

    this.isMountStarted = true;

    try {
      const handle = await navigator.storage.getDirectory();

      try {
        //@ts-ignore
        for await (const [name, entry] of handle.entries()) {
          try {
            // The second argument makes it recursive for directories
            await handle.removeEntry(name, { recursive: true });
          } catch (err) {
            console.error(`Failed to remove ${name}:`, err);
          }
        }
      } catch {}

      const webacess = await WebAccess.create({ handle });

      await configure({
        mounts: {
          '/inBrowser': await IndexedDB.create({ storeName: 'rc5DB' }),
          // this exists for the git cache, it is needed to speed up operations for the
          // file system access api
          '/gitfs': webacess,
        },
      });

      try {
        await this.fs.promises.mkdir('/inBrowser', { recursive: true });
      } catch (error: any) {
        debugLogError(error);
      }

      this.isBrowserFsLoaded = true;
      this.isMountStarted = false;
    } catch (error: any) {
      throw error;
    }
  };

  buildCmi5Course = async (
    r: RepoAccessObject,
    coursePath: string,
    zipName: string,
  ) => {
    const zipBlob = await this.buildCmi5CourseBlob(r, coursePath);
    saveAs(zipBlob, zipName);
  };

  /**
   * Seeds the ZenFS cmi5 build cache with the three files that copyIndexFile
   * needs (index.html, cfg.json, favicon.ico) by fetching them directly from
   * the running player dev server.  This lets buildCmi5CourseBlob work without
   * a pre-built cc-cmi5-player.zip — useful after a fresh clone or when the zip
   * is stale.
   */
  seedPlayerCacheFromDevServer = async (playerUrl: string): Promise<void> => {
    const base = playerUrl.replace(/\/$/, '');

    try {
      await this.clearDirectory(cmi5BuildCache);
    } catch {}
    try {
      await this.fs.promises.rmdir(cmi5BuildCache);
    } catch {}
    await this.createDirRecursive(cmi5BuildCache);

    for (const filename of ['index.html', 'cfg.json', 'favicon.ico']) {
      const res = await fetch(`${base}/${filename}`);
      if (!res.ok) throw new Error(`Failed to fetch ${filename} from player dev server (${res.status})`);
      const buf = await res.arrayBuffer();
      await this.fs.promises.writeFile(join(cmi5BuildCache, filename), new Uint8Array(buf));
    }
  };

  /**
   * Builds the CMI5 course zip and returns the raw Blob without saving to disk.
   * Used by TestInPlayerDialog to ship the zip directly to the player dev server.
   */
  buildCmi5CourseBlob = async (
    r: RepoAccessObject,
    coursePath: string,
  ): Promise<Blob> => {
    const repoPath = getRepoPath(r);

    try {
      const folderStructure = await this.getFolderStructure(
        join(repoPath, coursePath),
        coursePath,
        true,
      );

      if (!folderStructure) throw new Error('Course folder was empty');

      const courseData = generateCourseJson(folderStructure);
      if (!courseData) {
        throw new Error('Course data was null');
      }

      const fsOps: FsOperations = {
        readFile: async (path: string, encoding?: string) => {
          const content = await this.fs.promises.readFile(path);
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
          await this.fs.promises.writeFile(path, content);
        },
        deleteFolder: async (
          path: string,
          options: { recursive: boolean; force: boolean },
        ) => {
          try {
            await this.fs.promises.rm(path, options);
          } catch (err) {
            if (!options.force) throw err;
          }
        },
        copy: async (
          src: string,
          dest: string,
          options: { recursive: boolean },
        ) => {
          await this.copyRecursive(src, dest);
        },
        mkdir: async (path: string, options: { recursive: boolean }) => {
          await this.fs.promises.mkdir(path, options);
        },
      };
      await generateCourseDist(
        join(repoPath, coursePath),
        cmi5BuildCache,
        courseData,
        fsOps,
        join,
        relative,
        coursePath,
      );
      const cmi5Xml = generateCmi5Xml(courseData);
      const cmi5Path = path.join(cmi5BuildCache, 'cmi5.xml');

      await this.fs.promises.writeFile(cmi5Path, cmi5Xml.trim());

      const builtZip = await this.generateZip(cmi5BuildCache, '');

      return await builtZip.generateAsync({ type: 'blob' });
    } catch (error: any) {
      throw error;
    } finally {
      try {
        await this.clearDirectory(join(cmi5BuildCache, 'compiled_course'));
      } catch {}

      try {
        await this.fs.promises.rmdir(join(cmi5BuildCache, 'compiled_course'));
      } catch {}
    }
  };
  /**
   * Downloads and extracts the cmi5-player zip file if it doesn't already exist.
   *
   * @param version - Version to download (e.g., 'v0.7.0')
   * @param playerVersion - Player version string (e.g., '0.7.0')
   * @returns Promise<void>
   */
  downloadCmi5PlayerIfNeeded = async (
    downloadPlayer: () => Promise<any>,
  ): Promise<void> => {
    try {
      await this.clearDirectory(cmi5BuildCache);
    } catch {}

    try {
      await this.fs.promises.rmdir(cmi5BuildCache);
    } catch {}

    try {
      const response = await downloadPlayer();
      const zipBlob = await response.blob();
      const zipArrayBuffer = await zipBlob.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);

      debugLog('Extracting cmi5-player...');

      const fileNames = Object.keys(zip.files).filter((p) => p && p !== '/');

      const topLevels = new Set(
        fileNames.map((p) => p.split('/')[0]).filter(Boolean),
      );

      const stripRoot =
        topLevels.size === 1 && fileNames.some((p) => p.includes('/'));

      await this.createDirRecursive(cmi5BuildCache);

      // First pass: create all directories
      for (const relativePath of fileNames) {
        const entry = zip.files[relativePath];
        if (!entry || !entry.dir) continue;

        let cleanedPath = relativePath;
        if (stripRoot) {
          const parts = relativePath.split('/');
          parts.shift();
          cleanedPath = parts.join('/');
        }

        if (!cleanedPath) continue;

        const fullPath = join(cmi5BuildCache, cleanedPath);
        await this.createDirRecursive(fullPath);
      }

      // Second pass: write all files
      let successCount = 0;
      let failCount = 0;

      for (const relativePath of fileNames) {
        const entry = zip.files[relativePath];
        if (!entry || entry.dir) continue;

        let cleanedPath = relativePath;
        if (stripRoot) {
          const parts = relativePath.split('/');
          parts.shift();
          cleanedPath = parts.join('/');
        }

        if (!cleanedPath) continue;

        const fullPath = join(cmi5BuildCache, cleanedPath);

        try {
          // Ensure parent directory exists
          await this.createDirRecursive(dirname(fullPath));

          // Get content as uint8array
          const content = await entry.async('uint8array');

          // Write the file
          await this.fs.promises.writeFile(fullPath, content);

          // IMPORTANT: Verify the write was successful
          try {
            const stat = await this.fs.promises.stat(fullPath);
            const actualSize = stat.size;

            if (actualSize !== content.length) {
              console.error(
                `Size mismatch for ${fullPath}: expected ${content.length}, got ${actualSize}`,
              );
              failCount++;
            } else {
              successCount++;
            }
          } catch (verifyError) {
            console.error(`Failed to verify ${fullPath}:`, verifyError);
            failCount++;
          }
        } catch (writeError) {
          console.error(`Failed to write ${fullPath}:`, writeError);
          failCount++;
        }
      }

      const folders = await this.getFolderStructure(cmi5BuildCache, '', false);

      if (failCount > 0) {
        throw new Error(`Failed to extract ${failCount} files`);
      }
      debugLog('cmi5-player downloaded and extracted successfully');
    } catch (error: any) {
      debugLogError(`Error downloading cmi5-player: ${error}`);
      throw new Error(`Failed to download cmi5-player: ${error}`);
    }
  };

  // this is browser specific
  openLocalDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    forClone: boolean = false,
  ) => {
    const webacess = await WebAccess.create({ handle: dirHandle });

    try {
      if (forClone) {
        zenFs.umount('/localFileSystem');
        zenFs.mount('/localFileSystem', webacess);
      } else {
        zenFs.umount('/localFileSystem/' + dirHandle.name);
        zenFs.mount('/localFileSystem/' + dirHandle.name, webacess);
      }
      this.isBrowserFsLoaded = true;
    } catch (error: any) {
      throw error;
    }
  };

  async openLocalRepo(id?: string) {
    if (this.isElectron) {
      if (id) {
        if (!(await this.dirExists('/' + fsType.localFileSystem + '/' + id)))
          throw Error('Could not find dir');
        // We need to readd to recent projects to update the last opened time
        await window.fsApi.addRecentProject(id);
        const dirName = basename(id);
        return dirName;
      } else {
        const dirname = await window.fsApi.chooseProject();
        if (!dirname) throw new Error('No project selected');
        return dirname;
      }
    } else {
      let dirHandle: FileSystemDirectoryHandle | undefined;

      if (id) {
        dirHandle = await this.getDirHandle(id);
        this.currentProjectRecentsId = id;
      }
      if (!dirHandle) {
        // @ts-ignore
        dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
        });

        if (!dirHandle)
          throw Error(
            'There was an error when selecting the project directory, please try again',
          );

        // We do not want to add to recent projects if this is not a git project
        try {
          const gitFolder = await dirHandle.getDirectoryHandle('.git');
          if (!gitFolder) {
            this.currentProjectRecentsId = undefined;
            throw Error(noGitInProjectError);
          }

          await this.setDirHandle(dirHandle);
        } catch (error: any) {
          this.currentProjectRecentsId = undefined;
          throw Error(noGitInProjectError);
        }
      }

      await this.openLocalDirectory(dirHandle);
      return dirHandle.name;
    }
  }

  // This will just remove a recent local project
  async removeRecentProject(id: string) {
    if (this.isElectron) {
      await window.fsApi.removeRecentProject(id);
    } else {
      await del('courses/' + id);
    }
  }

  async createRepoInDir(
    parentDir: string,
    createFunction: () => Promise<void>,
  ) {
    if (this.isElectron) {
      await createFunction();
      // We don't need to take care of recents here, thats an electron backend job
    } else {
      // @ts-ignore
      let dirHandle = (await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      })) as FileSystemDirectoryHandle;

      if (!dirHandle) throw Error('No directory selected for clone');

      await this.openLocalDirectory(dirHandle, true);

      // Unmount any stale sub-mount for this repo name so initGitRepo writes
      // to the new parent directory, not a leftover WebAccess handle.
      try {
        zenFs.umount('/localFileSystem/' + parentDir);
      } catch {}

      await createFunction();

      // verify repo dir actually exits
      try {
        const repoDir = await dirHandle.getDirectoryHandle(parentDir);

        await this.setDirHandle(repoDir);

        await this.openLocalDirectory(repoDir);
      } catch (error: any) {
        console.error(error);
        this.currentProjectRecentsId = undefined;
        throw Error(
          'The create project operation failed to save files to your local computer.',
        );
      }
    }
  }

  async getGitRemoteUrl(
    dirHandle: FileSystemDirectoryHandle,
  ): Promise<string | undefined> {
    try {
      const gitDir = await dirHandle.getDirectoryHandle('.git', {
        create: false,
      });

      const configFile = await gitDir.getFileHandle('config', {
        create: false,
      });

      const file = await configFile.getFile();
      const text = await file.text();

      // Match: [remote "origin"] ... url = xxx
      const match = text.match(/\[remote\s+"origin"\][\s\S]*?url\s*=\s*(.+)/);

      return match?.[1]?.trim();
    } catch (err) {
      // Not a git repo or no access
      return undefined;
    }
  }

  // save the local file access directory handle so we dont have to ask for it each time
  setDirHandle = async (dirHandle: FileSystemDirectoryHandle) => {
    // Check if this directory is already in recents using isSameEntry
    const allKeys = await keys();
    const matchingKeys = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' && key.startsWith('courses/'),
    );
    const dirMetas = await getMany<DirMeta>(matchingKeys);

    for (const meta of dirMetas) {
      if (!meta?.dirHandle) continue;
      try {
        const isSame = await meta.dirHandle.isSameEntry(dirHandle);
        if (isSame) {
          const updatedMeta: DirMeta = {
            ...meta,
            lastAccessed: new Date().toISOString(),
            dirHandle,
          };
          this.currentProjectRecentsId = meta.id;
          await set('courses/' + meta.id, updatedMeta);
          return;
        }
      } catch {}
    }

    // No existing entry found — create a new one
    const id = crypto.randomUUID();

    const dirMeta: DirMeta = {
      lastAccessed: new Date().toISOString(),
      dirHandle,
      id,
      name: dirHandle.name,
      isValid: true,
      remoteUrl: await this.getGitRemoteUrl(dirHandle),
    };
    this.currentProjectRecentsId = id;

    await set('courses/' + id, dirMeta);

    // Enforce 10-project limit: remove oldest entries beyond the cap
    const updatedKeys = await keys();
    const courseKeys = updatedKeys.filter(
      (key): key is string =>
        typeof key === 'string' && key.startsWith('courses/'),
    );
    if (courseKeys.length > 10) {
      const allMetas = await getMany<DirMeta>(courseKeys);
      const sorted = allMetas
        .filter((m): m is DirMeta => !!m)
        .sort(
          (a, b) =>
            new Date(a.lastAccessed).getTime() -
            new Date(b.lastAccessed).getTime(),
        );
      const toRemove = sorted.slice(0, sorted.length - 10);
      for (const old of toRemove) {
        await del('courses/' + old.id);
      }
    }
  };

  getRecentProjects = async () => {
    const newMetas: DirMeta[] = [];

    if (this.isElectron) {
      try {
        return await window.fsApi.getRecentProjects();
      } catch {
        return [];
      }
    } else {
      const allKeys = await keys();

      const matchingKeys = allKeys.filter(
        (key): key is string =>
          typeof key === 'string' && key.startsWith('courses/'),
      );

      const dirMetas = await getMany<DirMeta>(matchingKeys);

      for (const meta of dirMetas) {
        if (!meta.dirHandle) continue;
        const status = await verifyHandlePermission(meta.dirHandle);
        const newMeta: DirMeta = {
          ...meta,
          isValid: status,
          remoteUrl:
            (await this.getGitRemoteUrl(meta.dirHandle)) || 'No remote URL',
        };

        newMetas.push(newMeta);
        await set('courses/' + meta.id, meta);
      }
    }
    return sortProjectMetas(newMetas);
  };

  getDirHandle = async (id: string) => {
    const saved = await get<DirMeta>('courses/' + id || 'rootdir');

    if (saved?.dirHandle) {
      const valid = await verifyHandlePermission(saved.dirHandle);
      if (!valid) {
        //@ts-ignore
        const permission = await saved.dirHandle.requestPermission({
          mode: 'readwrite',
        });
        if (!permission) return;
      }

      const newDirMeta: DirMeta = {
        ...saved,
        lastAccessed: new Date().toISOString(),
      };
      await set('courses/' + id || 'rootdir', newDirMeta);
    }

    return saved?.dirHandle;
  };

  /**
   * Deletes a local repository directory by name.
   *
   * @param repoName - The name of the repository to delete. Must not be null or an empty string.
   *
   * @remarks
   * - This function checks if the repo directory exists, clears its contents,
   *   and then removes the directory itself.
   * - If `repoName` is null or empty, the function logs an error and exits early.
   */
  deleteRepo = async (r: RepoAccessObject) => {
    const repoPath = getRepoPath(r);

    if (repoPath === null || repoPath === '') {
      console.error(
        'Deletion of repo was cancelled due to null or empty string given for repoName',
      );
      return;
    }
    const exists = await this.fs.promises.stat(repoPath).catch(() => null);
    if (!exists) {
      debugLogError('Repository does not exist');
      return;
    }

    await this.clearDirectory(repoPath);
    // .git is blocked from enumeration by the browser's File System Access API,
    // so clearDirectory won't see it. Delete it explicitly by name.
    try {
      await this.fs.promises.rmdir(`${repoPath}/.git`);
    } catch {}

    // For local filesystem repos in the browser, the root WebAccess mount point
    // cannot be deleted via removeEntry (browser throws "Name is not allowed").
    // Instead, unmount the zenFs path so the name can be reused immediately.
    if (!this.isElectron && r.fileSystemType === fsType.localFileSystem) {
      try {
        zenFs.umount(repoPath);
      } catch {}
      return;
    }

    await this.fs.promises.rmdir(repoPath);
  };

  /**
   * Deletes a directory.
   *
   * @param repoName - The name of the repository to delete. Must not be null or an empty string.
   * @param dirPath - The relative path to the directory for deletetion. Must not be null or an empty string.
   *
   */
  deleteDir = async (r: RepoAccessObject, dirPath: string) => {
    const repoPath = getRepoPath(r);
    const fullPath = join(repoPath, dirPath);
    try {
      await this.clearDirectory(fullPath);
      await this.fs.promises.rmdir(fullPath);
    } catch (error) {
      console.error(
        `Error deleting dir ${fullPath} in repository ${r.repoName}:`,
        error,
      );
    }
  };

  /**
   * Deletes a file.
   *
   * @param repoName - The name of the repository where the file exists. Must not be null or an empty string.
   * @param filePath - The relative path to the file for deletetion. Must not be null or an empty string.
   *
   */
  deleteFile = async (r: RepoAccessObject, filePath: string) => {
    const repoPath = getRepoPath(r);
    const fullPath = join(repoPath, filePath);

    try {
      const exists = await this.fs.promises.stat(fullPath).catch(() => null);
      if (!exists || !exists.isFile()) {
        console.error(
          `File ${filePath} does not exist in repository ${r.repoName}.`,
        );
        return;
      }

      await this.fs.promises.unlink(fullPath);
    } catch (error) {
      console.error(
        `Error deleting file ${filePath} in repository ${r.repoName}:`,
        error,
      );
    }
  };

  clearDirectory = async (dir: string) => {
    for (const item of await this.fs.promises.readdir(dir)) {
      const item_path = `${dir}/` + item;
      if ((await this.fs.promises.stat(item_path)).isFile()) {
        await this.fs.promises.unlink(item_path);
      } else {
        await this.clearDirectory(item_path);
        await this.fs.promises.rmdir(item_path);
      }
    }
  };

  clearFiles = async (
    r: RepoAccessObject,
    dir: string,
    extensions: string[],
  ) => {
    const repoPath = getRepoPath(r);
    const dirPath = join(repoPath, dir);

    try {
      const items = await this.fs.promises.readdir(dirPath);

      for (const item of items) {
        const itemPath = `${dirPath}/${item}`;
        const stat = await this.fs.promises.stat(itemPath);

        if (stat.isFile()) {
          for (const extension of extensions) {
            if (itemPath.endsWith(extension)) {
              await this.fs.promises.unlink(itemPath);
            }
          }
        } else if (stat.isDirectory()) {
          // await clearFiles(itemPath, extensions); // Recursively clear subdirectories
        }
      }
    } catch (error) {
      console.error(`Error clearing files of directory ${dirPath}:`, error);
    }
  };

  /**
   * Generates a zip file from the current repo.
   *
   * @param repoName - The name of the repository where the file exists. Must not be null or an empty string.
   *
   */
  generateRepoZip = async (r: RepoAccessObject) => {
    const repoPath = getRepoPath(r);

    const zip = new JSZip();
    await this.getFolderStructure(
      repoPath,
      repoPath,
      true,
      zip.folder(r.repoName),
    );
    return zip;
  };

  /**
   * Imports a git repo through a zip file
   */
  importGitRepoZip = async (zip: JSZip, r: RepoAccessObject) => {
    const repoPath = getRepoPath(r);

    await Promise.all(
      Object.keys(zip.files).map(async (relativePath) => {
        const index = relativePath.indexOf('/');
        if (index === -1) return;
        const cleanedPath = relativePath.slice(index);
        const entry = zip.files[relativePath];

        if (entry.dir) {
          // Create directory
          await this.createDirRecursive(`${repoPath}/${cleanedPath}`);
        } else {
          // Create file
          const content = await entry.async('uint8array');
          await this.createFile(r, cleanedPath, content);
        }
      }),
    );
  };

  /**
   * Imports a deployed cmi5 course through a zip file
   */
  importCmi5CourseZip = async (
    zip: JSZip,
    r: RepoAccessObject,
    courseName: string,
    courseDescription: string,
    courseId: string,
  ) => {
    const courseData = await getRc5Content(zip);

    if (!courseData.rc5Version) {
      throw new Error(
        'Cannot upload an RC5 zip file without a version number.\n' +
          'Add rc5Version: 0.0.1 to the bottom of your RC5.yaml file to override.',
      );
    }

    try {
      const auDirPaths = courseData.blocks.flatMap((b) =>
        b.aus.map((au) => au.dirPath),
      );
      const repoPath = getRepoPath(r);

      for (const relativePath of Object.keys(zip.files)) {
        const paths = resolveCourseZipPaths(relativePath, courseName);
        if (!paths) continue;

        const { pathInZip, pathInRepo } = paths;
        const entry = zip.files[relativePath];

        if (isExcludedAuFile(pathInZip, auDirPaths)) continue;

        if (entry.dir) {
          await this.createDirRecursive(`${repoPath}/${pathInRepo}`);
        } else {
          // We need to regenerate the RC5.yaml file to reflect the new name, course id, and description
          const content =
            basename(entry.name) === RC5_FILENAME
              ? await updateCourseData(
                  courseData,
                  courseName,
                  courseId,
                  courseDescription,
                )
              : await entry.async('uint8array');

          await this.createFile(r, pathInRepo, content);
        }
      }
    } catch (error) {
      console.error('Could not import course', error);
      throw Error('Could not complete the course import process');
    }
  };

  /**
   * Generates a zip file from the current course.
   *
   * @param repoName - The name of the repository where the file exists. Must not be null or an empty string.
   * @param repoName - The relative path to the course (where the mkdocs.yaml file exists).
   *
   */
  generateCourseZip = async (r: RepoAccessObject, courseFolder: string) => {
    const zip = new JSZip();
    const courseRoot = zip.folder(courseFolder);
    const repoPath = getRepoPath(r);
    const fullPath = join(repoPath, courseFolder);
    await this.getFolderStructure(fullPath, repoPath, true, courseRoot);

    return zip;
  };

  /**
   * Generates a zip file from the current course.
   *
   * @param repoName - The name of the repository where the file exists. Must not be null or an empty string.
   * @param repoName - The relative path to the course (where the mkdocs.yaml file exists).
   *
   */
  generateZip = async (path: string, basePath: string) => {
    const zip = new JSZip();
    const courseRoot = zip.folder(basePath);
    const fullPath = join(path);
    const files = await this.getFolderStructure(
      fullPath,
      path,
      true,
      courseRoot,
    );

    return zip;
  };

  /**
   * Gets folder structure with file modification times
   */
  getFolderStructureWithMtime = async (
    dir: string,
    basePath: string,
    getContents = false,
    zip: JSZip | null = null,
  ): Promise<FolderStructWithMtime[]> => {
    const folderStruct = await this.getFolderStructureRecWithMtime(
      dir,
      getContents,
      zip,
      basePath,
    );
    return folderStruct;
  };

  /**
   * Recursive helper that captures modification times
   */
  getFolderStructureRecWithMtime = async (
    dir: string,
    getContents = false,
    zip: JSZip | null = null,
    basePath: string,
  ): Promise<FolderStructWithMtime[]> => {
    const childItems: FolderStructWithMtime[] = [];

    try {
      const items = (await this.fs.promises.readdir(dir)).sort();

      for (const item of items) {
        const itemPath = `${dir}/${item}`;
        const stat = await this.fs.promises.stat(itemPath);

        const name = item.toString();
        const id = join(basePath, name);

        // Capture modification time
        const mtime = stat.mtimeMs as number;
        const mtimeDate = new Date(mtime).toISOString();

        const node: FolderStructWithMtime = {
          id,
          name,
          isBranch: true,
          mtime,
          mtimeDate,
        };

        if (stat.isFile()) {
          node.isBranch = false;

          if (getContents || zip) {
            const raw = await this.fs.promises.readFile(itemPath);
            const array = Uint8Array.from(raw as any);
            const text = new TextDecoder().decode(array);

            node.content = text;
            if (zip) {
              zip.file(name, text);
            }
          }
        } else if (stat.isDirectory()) {
          if (name === '.git') continue;

          node.isBranch = true;
          node.children = await this.getFolderStructureRecWithMtime(
            itemPath,
            getContents,
            zip?.folder(name),
            join(basePath, node.name),
          );
        }

        childItems.push(node);
      }
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.error(`Error reading directory: ${dir}`, error);
      }
    }

    return childItems;
  };

  getFolderStructure = async (
    dir: string,
    basePath: string,
    getContents = false,
    zip: JSZip | null = null,
  ): Promise<FolderStruct[]> => {
    if (this.isElectron) {
      const folderStruct = await window.fsApi.getFolderStructure(
        dir,
        basePath,
        getContents,
      );
      if (zip) {
        this.fillZip(folderStruct, zip);
      }
      return folderStruct;
    } else {
      const folderStruct = await this.getFolderStructureRec(
        dir,
        getContents,
        zip,
        basePath,
      );
      return folderStruct;
    }
  };

  fillZip(folderStruct: FolderStruct[], zip: JSZip) {
    for (const item of folderStruct) {
      if (item.isBranch) {
        const subZip = zip.folder(item.name);
        if (subZip && item.children) {
          this.fillZip(item.children, subZip);
        }
      } else {
        zip.file(item.name, item.content || '');
      }
    }
  }
  /**
   * This is a non repo protected function and can be used anywhere in the file system.
   * This function is able to get every folder in the frontend lightning-fs and return it as a list
   * of FolderStructure items.
   * You can use it to get the contents of the file or simply the tree structure.
   * Additionally it can fill a zip file as seen with the generateZip function.
   *
   * @param dir - The name of the directory where the recursion will begin.
   * @param getContents - If you want the folder structure returned to have the contents of each node.
   * @param zip - If you want the contents of the directories to be zipped up.
   *
   */
  getFolderStructureRec = async (
    dir: string,
    getContents = false,
    zip: JSZip | null = null,
    baseBath: string,
  ): Promise<FolderStruct[]> => {
    const childItems: FolderStruct[] = [];
    try {
      const items = (await this.fs.promises.readdir(dir)).sort();

      for (const item of items) {
        const itemPath = `${dir}/${item}`;
        const stat = await this.fs.promises.stat(itemPath);

        const name = item.toString();
        const id = join(baseBath, name);

        const node: FolderStruct = { id, name, isBranch: true };

        if (stat.isFile()) {
          node.isBranch = false;
          if (getContents || zip) {
            const raw = await this.fs.promises.readFile(itemPath);
            const array = Uint8Array.from(raw as any);
            const text = new TextDecoder().decode(array);

            node.content = text;
            if (zip) {
              zip.file(name, raw);
            }
          }
        } else if (stat.isDirectory()) {
          if (name === '.git') continue;
          node.isBranch = true;

          node.children = await this.getFolderStructureRec(
            itemPath,
            getContents,
            zip?.folder(name),
            join(baseBath, node.name),
          );
        }

        childItems.push(node);
      }
    } catch (error: any) {
      // Only log unexpected errors (ENOENT is expected when checking if directories exist)
      if (error?.code !== 'ENOENT') {
        console.error(`Error reading directory: ${dir}`, error);
      }
    }

    return childItems;
  };

  updateFile = async (
    r: RepoAccessObject,
    filePath: string,
    newContent: string | Uint8Array,
  ) => {
    try {
      const repoPath = getRepoPath(r);

      const fullPath = join(repoPath, filePath);

      // Check if the file exists before updating
      try {
        await this.fs.promises.stat(fullPath); // If this succeeds, the file exists
      } catch (error) {
        console.error('File does not exist, cannot update:', error);
        return;
      }

      // Update the file
      await this.fs.promises.writeFile(fullPath, newContent);
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  dirExists = async (path: string): Promise<boolean> => {
    try {
      const stat = await this.fs.promises.stat(path);
      return stat.isDirectory();
    } catch (error) {
      return false;
    }
  };

  createDirRecursive = async (dirPath: string) => {
    const parts = dirPath.split('/').filter(Boolean); // Split path into parts
    let currentPath = '';

    for (const part of parts) {
      currentPath += `/${part}`;
      if (!(await this.dirExists(currentPath))) {
        try {
          await this.fs.promises.mkdir(currentPath); // Create directory with POSIX mode
        } catch (error: any) {
          // In this case its not an error if it already exists
          if (error.code !== 'EEXIST') {
            console.error(`Error creating directory: ${currentPath}`, error);
            throw error;
          }
        }
      }
    }
  };

  // Repo access object level copy, this should make it easier to ensure you are going within the same repo
  copyToDir = async (
    r: RepoAccessObject,
    srcPath: string,
    destDirPath: string,
    includeTopLevelFolder = true,
  ): Promise<void> => {
    const repoPath = getRepoPath(r);
    const absSrcPath = path.join(repoPath, srcPath);
    const absDestDirPath = path.join(repoPath, destDirPath);

    const stat = await this.fs.promises.stat(absSrcPath);

    if (stat.isFile()) {
      await this.copyFile(absSrcPath, absDestDirPath);
    } else if (stat.isDirectory()) {
      const items = await this.getFolderStructure(absSrcPath, '', true);
      const folderName = absSrcPath.split('/').pop();
      if (!folderName) return;

      if (includeTopLevelFolder) {
        await this.copyFolder(absDestDirPath, folderName, items);
      } else {
        await this.copyFolder(absDestDirPath, '', items); // No folder nesting
      }
    } else {
      throw new Error(`Unknown file type for: ${absSrcPath}`);
    }
  };

  async copyRecursive(src: string, dest: string) {
    try {
      const st = await this.fs.promises.stat(src);

      if (st.isDirectory()) {
        // Create destination directory
        await this.fs.promises.mkdir(dest, { recursive: true });

        // Read all entries in the directory
        const entries = await this.fs.promises.readdir(src);

        // Recursively copy all entries sequentially
        for (const name of entries) {
          await this.copyRecursive(
            join(src, name.toString()),
            join(dest, name.toString()),
          );
        }
      } else {
        // It's a file - ensure parent directory exists
        await this.fs.promises.mkdir(dirname(dest), { recursive: true });

        // Copy the file
        const content = await this.fs.promises.readFile(src);
        await this.fs.promises.writeFile(dest, content);
      }
    } catch (error) {
      debugLogError(`Failed to copy ${src} to ${dest}: ${error}`);
      throw error; // Re-throw so caller knows it failed
    }
  }

  copyFolder = async (
    destDirPath: string,
    folderName: string,
    items: FolderStruct[],
  ): Promise<void> => {
    const basePath = folderName
      ? path.join(destDirPath, folderName)
      : destDirPath;

    if (folderName) {
      await this.createDirRecursive(basePath);
    }

    for (const item of items) {
      const targetPath = path.join(basePath, item.name);

      if (item.isBranch) {
        if (item.children) {
          await this.copyFolder(basePath, item.name, item.children);
        } else {
          await this.fs.promises.readdir(targetPath); // Just ensure directory exists
        }
      } else {
        await this.fs.promises.writeFile(targetPath, item?.content || '');
      }
    }
  };

  copyFile = async (srcPath: string, destDirPath: string): Promise<void> => {
    const fileName = srcPath.split('/').pop();
    if (!fileName) throw new Error('Invalid file path');

    const destPath = path.join(destDirPath, fileName);
    const content = await this.fs.promises.readFile(srcPath);
    await this.createDirRecursive(destDirPath); // Ensure destination dir exists
    await this.fs.promises.writeFile(destPath, content);
  };

  /**
   * Moves a file or folder to a new location within the same repository.
   *
   * @param repoName - The name of the repository.
   * @param srcPath - The current path of the file/folder to move (relative to the repo root).
   * @param destPath - The new path for the file/folder (relative to the repo root).
   */
  mvFile = async (
    repoName: string,
    srcPath: string,
    destPath: string,
  ): Promise<void> => {
    try {
      const fullSrcPath = `/${repoName}/${srcPath}`;
      const fullDestPath = `/${repoName}/${destPath}`;

      // Ensure source exists
      const srcStat = await this.fs.promises
        .stat(fullSrcPath)
        .catch(() => null);
      if (!srcStat) {
        console.error(`Source path does not exist: ${fullSrcPath}`);
        return;
      }

      // Ensure destination directory exists
      const destDir = fullDestPath.substring(0, fullDestPath.lastIndexOf('/'));
      await this.createDirRecursive(destDir);

      // Perform the move
      await this.fs.promises.rename(fullSrcPath, fullDestPath);
    } catch (error) {
      console.error(
        `Error moving file or folder from ${srcPath} to ${destPath}:`,
        error,
      );
    }
  };

  /**
   * renames a repository.
   *
   * @param repoName - The name of the repository.
   * @param srcPath - The current path of the file/folder to move (relative to the repo root).
   * @param destPath - The new path for the file/folder (relative to the repo root).
   */
  renameRepo = async (
    srcR: RepoAccessObject,
    destR: RepoAccessObject,
  ): Promise<void> => {
    try {
      const fullSrcPath = getRepoPath(srcR);
      const fullDestPath = getRepoPath(destR);

      // Ensure source exists
      const srcStat = await this.fs.promises
        .stat(fullSrcPath)
        .catch(() => null);
      if (!srcStat) {
        console.error(`Source path does not exist: ${fullSrcPath}`);
        return;
      }
      // Perform the move
      await this.fs.promises.rename(fullSrcPath, fullDestPath);
    } catch (error) {
      console.error(
        `Error moving file or folder from ${srcR.repoName} to ${destR.repoName}:`,
        error,
      );
    }
  };

  // Function to create a file, ensuring directories exist
  createFile = async (
    r: RepoAccessObject,
    filePath: string,
    content: string | Uint8Array,
  ) => {
    try {
      const repoPath = getRepoPath(r);
      const fullPath = join(repoPath, filePath);

      const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

      await this.createDirRecursive(dirPath);
      await this.fs.promises.writeFile(fullPath, content);
    } catch (error) {
      console.error('Error writing file:', error);
    }
  };

  // Function to create a directory
  createDir = async (r: RepoAccessObject, dirPath: string) => {
    const repoPath = getRepoPath(r);
    const fullPath = join(repoPath, dirPath);
    try {
      await this.createDirRecursive(fullPath);
    } catch (error) {
      console.error('Error creating dir:', error);
      throw error;
    }
  };

  splitLastOccurrence = (path: string): [string, string] => {
    const lastIndex = path.lastIndexOf('/');
    if (lastIndex === -1) return ['', path]; // No slash found, return as is
    return [path.substring(0, lastIndex), path.substring(lastIndex + 1)];
  };

  renameFileOrFolder = async (
    r: RepoAccessObject,
    oldPath: string,
    newName: string,
  ) => {
    try {
      const repoPath = getRepoPath(r);
      const fullOldPath = join(repoPath, oldPath);

      const parentDir = dirname(fullOldPath);

      const fullNewPath = join('/', parentDir, newName);

      // Ensure the old file/folder exists
      await this.fs.promises.stat(fullOldPath);

      // Perform the rename (move)
      await this.fs.promises.rename(fullOldPath, fullNewPath);
    } catch (error) {
      console.error('Error renaming file or folder:', error);
    }
  };

  readFileContent = async (
    r: RepoAccessObject,
    filePath: string,
  ): Promise<{ content: string | Uint8Array; type: string } | null> => {
    try {
      const repoPath = getRepoPath(r);

      const fullPath = join(repoPath, filePath);
      const content = await this.fs.promises.readFile(fullPath);

      const fileType = filePath.split('.').pop() || 'plaintext';
      return { content, type: fileType };
    } catch (error: any) {
      // Only log unexpected errors (ENOENT is expected when checking if files exist)
      if (error?.code !== 'ENOENT') {
        console.error('Error reading file:', error);
      }
      return null;
    }
  };

  blobImageFile = async (
    r: RepoAccessObject,
    filePath: string,
    fileType: string,
  ): Promise<Blob | MediaSource | null> => {
    try {
      const content = await this.readFileContent(r, filePath);
      if (content === null) return null;

      if (content.content instanceof Uint8Array) {
        const blob = new Blob([new Uint8Array(content.content)], {
          type: fileType,
        });
        return blob;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error blobbing image:', error);
      return null;
    }
  };

  getFileContent = async (
    r: RepoAccessObject,
    filePath: string,
  ): Promise<FileContent | null> => {
    try {
      const res = await this.readFileContent(r, filePath);
      if (res === null) {
        return null;
      }
      const content = res.content;

      let fileType: string;
      let fileContent: string | Uint8Array = '';

      // Detect file type
      if (filePath.endsWith('.json')) {
        fileType = 'json';
      } else if (/\.(png|jpg|jpeg|gif)$/i.test(filePath)) {
        fileType = 'image';
      } else {
        fileType = 'plaintext';
      }

      if (fileType === 'image') {
        if (content instanceof Uint8Array) {
          const blob = new Blob([new Uint8Array(content)], {
            type: 'image/png',
          });
          const imageUrl = URL.createObjectURL(blob);
          fileContent = imageUrl;
        }
      } else {
        // Ensure content is in the right format for text
        if (typeof content === 'string') {
          fileContent = content; // Already a string, no decoding needed
        } else {
          fileContent = new TextDecoder().decode(content);
        }
      }
      const file: FileContent = { content: fileContent, type: fileType };

      return file;
    } catch (error) {
      debugLog('Error reading file:', error);
      return { content: '', type: 'plaintext' };
    }
  };
}
export async function verifyHandlePermission(
  fileHandle: FileSystemDirectoryHandle,
) {
  const options = { mode: 'readwrite' };

  // Check if permission was already granted. If so, return true.
  //@ts-ignore
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

export function createFS(isElectron: boolean) {
  return new GitFS(isElectron);
}

export type FileContent = {
  content: string;
  type: string;
};

export const MAX_FS_SLUG_LENGTH = 100;
