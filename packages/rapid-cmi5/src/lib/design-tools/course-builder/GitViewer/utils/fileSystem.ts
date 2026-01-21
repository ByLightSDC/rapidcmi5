import {
  cleanMkdocs,
  FolderStruct,
  rc5MetaFilename,
} from '@rapid-cmi5/cmi5-build-common';
import JSZip from 'jszip';
import path, { basename, dirname, join } from 'path-browserify';
import YAML from 'yaml';
import { configure, fs as zenFs } from '@zenfs/core';
import { IndexedDB, WebAccess } from '@zenfs/dom';
import { RepoAccessObject } from '../../../../redux/repoManagerReducer';
import { set, get, keys, getMany } from 'idb-keyval';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';
import { debugLog, debugLogError } from '@rapid-cmi5/ui';
import { electronFs } from './ElectronFsApi';
import { CourseData } from '@rapid-cmi5/cmi5-build-common';
import { IFs } from 'memfs';
import { getFsInstance } from './gitFsInstance';

export const getRepoPath = (r: RepoAccessObject) =>
  `/${r.fileSystemType}/${r.repoName}`;

export type FileSystemObject = typeof zenFs | typeof electronFs | IFs;

export const gitCache = `/gitfs/gittemp`;
export const modifiedFileCache = 'rc5ModifiedFiles.json';
export type DirMeta = {
  dirHandle: FileSystemDirectoryHandle;
  id: string;
  createdAt: string;
  name: string;
  isValid: boolean;
  lastAccessed: string;
  remoteUrl?: string;
};

export class GitFS {
  public fs: FileSystemObject;

  public isBrowserFsLoaded: boolean = false;
  public isLocalFsLoaded: boolean = false;
  public isMountStarted: boolean = false;
  public isElectron: boolean = false;
  public cache = {};

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
        await this.fs.promises.mkdir(gitCache, { recursive: true });
      } catch {}
      try {
        await this.fs.promises.mkdir('/inBrowser', { recursive: true });
      } catch {}

      this.isBrowserFsLoaded = true;
    } catch (error: any) {
      throw error;
    }
  };
  // Write a file to the individual repo so that we don't have to scan the entire git repo for files
  writeModifiedFiles = async (
    r: RepoAccessObject,
    modifiedFiles: ModifiedFile[],
  ) => {
    const path = join(getRepoPath(r), modifiedFileCache);
    const filteredFiles = modifiedFiles
      .filter((f) => f.name !== modifiedFileCache)
      .map((f) => f.name);

    await this.fs.promises.writeFile(
      path,
      JSON.stringify(filteredFiles, null, 4),
    );
  };
  // A cache so that we don't have to scan the entire git repo for files
  readModifiedFiles = async (
    r: RepoAccessObject,
  ): Promise<string[] | undefined> => {
    const res = await this.getFileContent(r, modifiedFileCache);
    if (res === null) return;
    return JSON.parse(res.content) as string[];
  };
  clearGitDir = async (handle: FileSystemDirectoryHandle) => {
    try {
      //@ts-ignore
      await handle.remove({ recursive: true });
    } catch (error: any) {
      debugLogError(error);
    }
  };

  // this is browser specific
  openLocalDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    forClone: boolean = false,
  ) => {
    const webacess = await WebAccess.create({ handle: dirHandle });

    try {
      zenFs.umount('/localFileSystem');
      if (forClone) {
        zenFs.mount('/localFileSystem', webacess);
      } else {
        zenFs.mount('/localFileSystem/' + dirHandle.name, webacess);
      }

      this.isBrowserFsLoaded = true;
    } catch (error: any) {
      throw error;
    }
  };
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
    const id = crypto.randomUUID();

    const dirMeta: DirMeta = {
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      dirHandle,
      id,
      name: dirHandle.name,
      isValid: true,
      remoteUrl: await this.getGitRemoteUrl(dirHandle),
    };

    console.log('Set dir ', dirMeta);
    await set('courses/' + id || 'rootdir', dirMeta);
  };

  getLocalDirs = async () => {
    const allKeys = await keys();

    const matchingKeys = allKeys.filter(
      (key): key is string =>
        typeof key === 'string' && key.startsWith('courses/'),
    );

    const dirMetas = await getMany<DirMeta>(matchingKeys);
    const newMetas: DirMeta[] = [];

    for (const meta of dirMetas) {
      const status = await verifyHandlePermission(meta.dirHandle);
      const newMeta: DirMeta = { ...meta, isValid: status };
      console.log('new MEta', newMeta);
      newMetas.push(newMeta);
      await set('courses/' + meta.id, meta);
    }

    console.log('Let see whats here return all dirs', dirMetas);

    return newMetas.sort((a, b) => {
      const aTime = new Date(a.lastAccessed ?? a.createdAt).getTime();
      const bTime = new Date(b.lastAccessed ?? b.createdAt).getTime();
      return bTime - aTime;
    });
  };

  getDirHandle = async (id?: string) => {
    console.log('Let see whats here', id);
    const saved = await get<DirMeta>('courses/' + id || 'rootdir');
    console.log('Let see whats here saved', saved);

    if (saved) {
      const valid = await verifyHandlePermission(saved.dirHandle);
      if (!valid) {
        //@ts-ignore
        const permission = await saved.dirHandle.requestPermission({
          mode: 'readwrite',
        });
        if (!permission) return;
      }
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
      console.error('Repository does not exist');
      return;
    }

    await this.clearDirectory(repoPath);
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
    const repoPath = getRepoPath(r);
    const prefix = 'compiled_course/blocks';
    const filesForRemoval = [
      'config.json',
      'cfg.json',
      'index.html',
      'favicon.ico',
    ];
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    // ensure that the RC5.yaml file exists before importing
    const rc5Path = Object.keys(zip.files).find((path) =>
      path.endsWith(rc5MetaFilename),
    );

    if (!rc5Path) {
      throw Error('No RC5.yaml file was found in the uploaded zip file');
    }
    let content = await zip.files[rc5Path].async('uint8array');

    const contentString = decoder.decode(content);
    const courseData: CourseData = YAML.parse(contentString);
    if (!courseData.rc5Version) {
      throw Error(
        'Cannot upload an RC5 zip file without a version number, aborting',
      );
    }

    await Promise.all(
      Object.keys(zip.files).map(async (relativePath) => {
        const entry = zip.files[relativePath];

        if (!relativePath.startsWith(prefix)) return;
        let cleanedPath = relativePath.slice(prefix.length + 1);
        cleanedPath = cleanedPath.includes('/')
          ? cleanedPath.slice(cleanedPath.indexOf('/'))
          : cleanedPath;

        cleanedPath = join(courseName, cleanedPath);

        if (filesForRemoval.includes(basename(entry.name))) return;
        if (entry.dir) {
          // Create directory
          await this.createDirRecursive(`${repoPath}/${cleanedPath}`);
        } else {
          // Create file
          let content: string | Uint8Array = await entry.async('uint8array');

          if (relativePath.endsWith('.md')) {
            const contentString = decoder.decode(content);

            content = cleanMkdocs(contentString, entry.name);
          }
          // Course rename function for import
          if (basename(entry.name) === rc5MetaFilename) {
            courseData.courseId = courseId;
            courseData.courseDescription = courseDescription;
            courseData.courseTitle = courseName;
            for (const block of courseData.blocks) {
              block.blockName = courseName;
              for (const au of block.aus) {
                const index = au.dirPath.indexOf('/');
                const oldCoursePathRemoved =
                  index > 0 ? au.dirPath.slice(index) : '';

                au.dirPath = join(courseName, oldCoursePathRemoved);
                for (const slide of au.slides) {
                  slide.filepath = join(au.dirPath, basename(slide.filepath));
                }
              }
            }

            content = encoder.encode(YAML.stringify(courseData));
          }

          await this.createFile(r, cleanedPath, content);
        }
      }),
    ).catch((err) => {
      console.error('Import error:', err);
      throw err;
    });
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
      return await this.getFolderStructureRec(dir, getContents, zip);
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
  ): Promise<FolderStruct[]> => {
    const childItems: FolderStruct[] = [];
    try {
      const items = (await this.fs.promises.readdir(dir)).sort();

      for (const item of items) {
        const itemPath = `${dir}/${item}`;
        const stat = await this.fs.promises.stat(itemPath);

        const id = itemPath.split('/').slice(3).join('/');
        const name = item.toString();
        const node: FolderStruct = { id, name, isBranch: true };

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
          node.isBranch = true;

          node.children = await this.getFolderStructureRec(
            itemPath,
            getContents,
            zip?.folder(name),
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
      const items = await this.getFolderStructure(absSrcPath, repoPath, true);
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

  /**
   * Copies the `.git` directory of a given repository into a temporary directory.
   *
   *
   * @async
   * @function copyGit
   * @param {RepoAccessObject} r - The repository access object containing metadata
   *   used to resolve the repository path via `getRepoPath(r)`.
   *
   * @returns {Promise<void>} Resolves when the copy operation completes.
   *
   *
   * @remarks
   * - This method is needed due to the slow nature of the file system access api
   * - The cp method on OPFS has had issues in the past with nested directories,
   *   that is why we are using a more drawn out recursive copy function
   */
  copyGit = async (r: RepoAccessObject): Promise<void> => {
    if (this.isElectron) return;

    const repoPath = getRepoPath(r);
    const absSrcPath = path.join(repoPath, '.git');
    const absDestDirPath = gitCache;

    try {
      await this.fs.promises.stat(absSrcPath);
    } catch {
      debugLogError('file does not exist');
      return;
    }
    try {
      await this.fs.promises.rm(absDestDirPath, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error('Error deleting dir:', error);
    }

    try {
      await this.fs.promises.mkdir(absDestDirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating dir:', error);
    }

    const retries = 4;
    const delayMs = 1000;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.copyRecursive(absSrcPath, absDestDirPath);
        return; // success
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt < retries) {
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          console.error('All attempts failed');
          throw err; // rethrow after final failure
        }
      }
    }
  };

  async copyRecursive(src: string, dest: string) {
    const st = await this.fs.promises.stat(src);
    if (st.isDirectory()) {
      await this.fs.promises.mkdir(dest, { recursive: true });
      const entries = await this.fs.promises.readdir(src);
      Promise.resolve();
      await Promise.all(
        entries.map((name) =>
          this.copyRecursive(
            join(src, name.toString()),
            join(dest, name.toString()),
          ),
        ),
      );
    } else {
      await this.fs.promises.mkdir(dirname(dest), { recursive: true });
      try {
        const content = await this.fs.promises.readFile(src);
        await this.fs.promises.writeFile(dest, content);
      } catch (error) {
        debugLogError(`Failed to copy ${src}: ${error}`);
      }
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
