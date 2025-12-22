import { FolderStruct } from '@rapid-cmi5/cmi5-build-common';

import fs, { constants } from 'fs';

import { app } from 'electron';

import path from 'path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

const fsp = fs.promises;

function toPosix(p: string) {
  return path.posix.normalize(p.replace(/\\/g, '/'));
}
// Type aliases for readability
export type FileData = string | Uint8Array;
export interface FileStat {
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  mode: number;
  isFile: boolean;
  isDirectory: boolean;
  path: string;
  isSymbolicLink: boolean;
}

export interface DirEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}
function getRapidBase(isTestMode: boolean) {
  // Change this if you prefer another location
  return path.join(
    app.getPath('userData'),
    isTestMode ? 'RapidCMI5Test' : 'RapidCMI5',
  );
}

function resolveSafe(userPath: string, isTestMode: boolean): string {
  const base = getRapidBase(isTestMode);

  // Coerce to string
  const raw = String(userPath);

  // Resolve against base and verify containment

  const resolved = path.join(base, raw);
  const rel = path.relative(base, resolved);

  // rel must NOT climb out (start with '..') and must not be absolute
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes the Rapid CMI5 sandbox ${resolved}`);
  }

  return resolved;
}
async function clearDirectory(dir: string) {
  const entries = await fs.promises.readdir(dir);

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry);
      await fs.promises.rm(fullPath, { recursive: true, force: true });
    }),
  );
}

export class ElectronFsHandler {
  public isTestMode: boolean;
  private baseReady: Promise<void>;

  constructor(isTestMode: boolean) {
    this.isTestMode = isTestMode;

    const base = getRapidBase(isTestMode);
    // reset before each test run
    if (isTestMode) {
      clearDirectory(base);
    }

    this.baseReady = fsp.mkdir(base, { recursive: true }).then(() => {});
  }

  private async getFullPath(p: string): Promise<string> {
    await this.baseReady;
    return resolveSafe(p, this.isTestMode);
  }

  async writeFile(p: string, data: FileData) {
    const full = await this.getFullPath(p);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, data);
    return true;
  }

  async readFile(p: string): Promise<Uint8Array> {
    const full = await this.getFullPath(p);
    const data = await fsp.readFile(full);
    return new Uint8Array(data);
  }

  async exists(p: string) {
    const full = await this.getFullPath(p);
    try {
      await fsp.access(full, constants.F_OK);
      return true; // path exists
    } catch {
      return false; // does not exist
    }
  }

  async stat(p: string): Promise<FileStat | null> {
    const full = await this.getFullPath(p);
    try {
      const s = await fsp.stat(full);

      return {
        size: s.size,
        mtimeMs: s.mtimeMs,
        ctimeMs: s.ctimeMs,
        mode: s.mode,
        isFile: s.isFile(),
        isDirectory: s.isDirectory(),
        path: full,
        isSymbolicLink: s.isSymbolicLink(),
      };
    } catch {
      return null;
    }
  }

  async copyFile(src: string, dest: string) {
    const fullSrc = await this.getFullPath(src);
    const fullDest = await this.getFullPath(dest);
    await fsp.mkdir(path.dirname(fullDest), { recursive: true });
    await fsp.copyFile(fullSrc, fullDest, constants.COPYFILE_FICLONE);
    return true;
  }

  async rm(p: string, recursive = false) {
    const full = await this.getFullPath(p);
    await fsp.rm(full, { recursive, force: true });
    return true;
  }

  async rename(oldPath: string, newPath: string) {
    const fullOld = await this.getFullPath(oldPath);
    const fullNew = await this.getFullPath(newPath);
    await fsp.mkdir(path.dirname(fullNew), { recursive: true });
    await fsp.rename(fullOld, fullNew);
    return true;
  }

  async mkdir(p: string, recursive: boolean = false) {
    const full = await this.getFullPath(p);
    await fsp.mkdir(full, { recursive });
    return true;
  }

  async readdir(p: string): Promise<DirEntry[]> {
    const full = await this.getFullPath(p);
    const entries = await fsp.readdir(full, { withFileTypes: true });
    return entries.map(
      (e: { name: any; isFile: () => any; isDirectory: () => any }) => ({
        name: e.name,
        isFile: e.isFile(),
        isDirectory: e.isDirectory(),
      }),
    );
  }

  async readlink(vpath: string): Promise<string> {
    const full = await this.getFullPath(vpath);

    const target = await fsp.readlink(full, { encoding: 'utf8' });
    // Return POSIX-style path to keep isomorphic-git happy
    return target;
  }

  // On Windows, fs.symlink needs a "type" hint ('file' | 'dir') and may require admin/dev mode
  async symlink(targetV: string, linkV: string): Promise<void> {
    const full = await this.getFullPath(targetV);

    // If the target is absolute (virtual), map it; if it's relative, leave as-is
    const isAbsVirtual = targetV.startsWith('/');
    const targetReal = isAbsVirtual ? await this.getFullPath(targetV) : targetV;

    let type: 'file' | 'dir' | undefined = undefined;
    try {
      const st = await fsp.lstat(
        isAbsVirtual
          ? targetReal
          : await this.getFullPath(
              path.posix.join(path.posix.dirname(linkV), targetV),
            ),
      );
      type = st.isDirectory() ? 'dir' : 'file';
    } catch {
      // If target doesn't exist yet, leave type undefined (Node will guess)
    }

    try {
      await fsp.symlink(targetReal, full, type);
    } catch (e: any) {
      // Windows often throws EPERM if not admin or dev-mode; fall back or rethrow
      if (
        process.platform === 'win32' &&
        (e.code === 'EPERM' || e.code === 'EWINDOWS')
      ) {
        // Fallback: emulate a symlink by writing the link text into a file.
        // NOTE: This is not a true symlink; isomorphic-git may treat it as a plain file.
        await fsp.writeFile(full, targetV, 'utf8');
        return;
      }
      throw e;
    }
  }

  getFolderStructure = async (
    p: string,
    repoPath: string,
    getContents = false,
    zip = false,
  ): Promise<FolderStruct[]> => {
    const full = await this.getFullPath(p);
    const fullBase = await this.getFullPath(repoPath);

    const struct = await this.getFolderStructureRec(
      full,
      fullBase,
      getContents,
      zip,
    );

    return struct;
  };

  getFolderStructureRec = async (
    dir: string,
    basePath: string,
    getContents = false,
    zip = false,
  ): Promise<FolderStruct[]> => {
    const childItems: FolderStruct[] = [];

    try {
      const dirents = (await fsp.readdir(dir, { withFileTypes: true })).sort(
        (a, b) => a.name.localeCompare(b.name),
      );

      const nodes = await Promise.all(
        dirents.map(async (entry) => {
          const name = entry.name;

          // Fast skip of .git folder (and files named .git)
          if (name === '.git') {
            return null;
          }

          const itemPath = path.join(dir, name);

          const id = toPosix(path.relative(basePath, itemPath));
          const node: FolderStruct = {
            id,
            name,
            isBranch: entry.isDirectory(),
          };

          if (entry.isFile()) {
            const extension = path.extname(entry.name);
            node.isBranch = false;

            const validExtensions = ['.md', '.yaml', '.json'];

            if (getContents) {
              if (zip) {
                const text = await fsp.readFile(itemPath);
                node.content = text;
              } else if (validExtensions.includes(extension)) {
                const text = await fsp.readFile(itemPath, 'utf8');
                node.content = text;
              }
            }
          } else if (entry.isDirectory()) {
            // 3) Recurse for directories
            node.isBranch = true;
            node.children = await this.getFolderStructureRec(
              itemPath,
              basePath,
              getContents,
              zip,
            );
          }

          return node;
        }),
      );

      for (const n of nodes) {
        if (n) childItems.push(n);
      }
    } catch (error: any) {
      // Only log unexpected errors (ENOENT is expected when checking if directories exist)
      if (error?.code !== 'ENOENT') {
        console.error(`Error reading directory: ${dir}`, error);
      }
    }

    return childItems;
  };

  async gitAddRemote(p: string, remoteUrl: string) {
    const fullPath = await this.getFullPath(p);

    await git.addRemote({
      fs,
      dir: fullPath,
      remote: 'origin',
      url: remoteUrl,
    });
  }

  async revertFileToHEAD(p: string, filePath: string) {
    const fullPath = await this.getFullPath(p);
    const fullFilePath = await this.getFullPath(filePath);

    const headOid = await git.resolveRef({
      fs,
      dir: fullPath,
      ref: 'HEAD',
    });

    // Read the file's blob from HEAD
    const { blob } = await git.readBlob({
      fs,
      dir: fullPath,
      oid: headOid,
      filepath: fullFilePath,
    });

    await fsp.writeFile(fullFilePath, blob);
    await git.add({ fs, dir: fullPath, filepath: fullFilePath });
  }

  async gitWriteRef(p: string, branch: string, commitHash: string) {
    const fullPath = await this.getFullPath(p);

    return await git.writeRef({
      fs,
      dir: fullPath,
      ref: `refs/heads/${branch}`,
      value: commitHash,
      force: true,
    });
  }

  async gitCheckout(p: string, branch: string) {
    const fullPath = await this.getFullPath(p);

    await git.checkout({
      fs: fsp,
      dir: fullPath,
      ref: branch,
    });
  }

  async getAllGitBranches(p: string): Promise<string[]> {
    const fullPath = await this.getFullPath(p);
    return await git.listBranches({ fs: fsp, dir: fullPath });
  }
  async getGitConfig(p: string, configPath: string): Promise<any> {
    const fullPath = await this.getFullPath(p);
    return await git.getConfig({
      fs,
      dir: fullPath,
      path: configPath,
    });
  }

  async setGitConfig(
    p: string,
    configPath: string,
    value: string,
  ): Promise<void> {
    const fullPath = await this.getFullPath(p);
    return await git.setConfig({
      fs,
      dir: fullPath,
      path: configPath,
      value,
    });
  }

  async getCurrentBranch(p: string): Promise<string | void> {
    const fullPath = await this.getFullPath(p);

    return await git.currentBranch({
      fs: fsp,
      dir: fullPath,
    });
  }

  async chmod(vpath: string, mode: number | string): Promise<void> {
    const real = await this.getFullPath(vpath);
    const m = typeof mode === 'string' ? parseInt(mode, 8) : mode;
    try {
      await fsp.chmod(real, m);
    } catch (e: any) {
      // On Windows chmod is mostly a no-op; you can safely ignore EPERM here if desired
      if (
        process.platform === 'win32' &&
        (e.code === 'EPERM' || e.code === 'EINVAL')
      ) {
        return; // swallow as no-op
      }
      throw e;
    }
  }

  async getStatus(p: string): Promise<any[]> {
    const fullPath = await this.getFullPath(p);

    return await git.statusMatrix({
      fs,
      dir: fullPath,
    });
  }

  async gitInitRepo(p: string, defaultBranch: string) {
    const fullPath = await this.getFullPath(p);

    await git.init({ fs, dir: fullPath, defaultBranch });
  }

  async gitResolveRef(p: string, branch: string) {
    const fullPath = await this.getFullPath(p);

    return await git.resolveRef({
      fs,
      dir: fullPath,
      ref: `refs/remotes/origin/${branch}`,
    });
  }

  async gitLog(p: string): Promise<any[]> {
    const fullPath = await this.getFullPath(p);

    return await git.log({
      fs,
      dir: fullPath,
    });
  }

  async cloneRepo(
    p: string,
    url: string,
    branch: string,
    shallowClone: boolean,
    username: string,
    password: string,
  ) {
    const fullPath = await this.getFullPath(p);
    await git.clone({
      fs: fs,
      http,
      dir: fullPath,
      url,
      ref: branch,
      depth: shallowClone ? 1 : undefined,
      singleBranch: true,
      onAuth: () => ({ username, password }),
    });
  }

  async gitCommit(
    p: string,
    message: string,
    committerName: string,
    committerEmail: string,
  ) {
    const fullPath = await this.getFullPath(p);

    await git.commit({
      fs,
      dir: fullPath,
      message,
      author: { name: committerName, email: committerEmail },
    });
  }

  async pushRepo(p: string, username: string, password: string) {
    const fullPath = await this.getFullPath(p);

    await git.push({
      fs,
      http,
      dir: fullPath,
      onAuth: () => ({ username, password }),
    });
  }

  async pullRepo(
    p: string,
    branch: string,
    username: string,
    password: string,
  ) {
    const fullPath = await this.getFullPath(p);
    await git.pull({
      fs: fs,
      http,
      dir: fullPath,
      ref: branch,
      singleBranch: true,
      fastForward: false,
      onAuth: () => ({ username, password }),
    });
  }

  async gitStash(p: string, op: 'list' | 'pop' | 'push') {
    const fullPath = await this.getFullPath(p);

    return await git.stash({
      fs,
      dir: fullPath,
      op,
    });
  }

  async listRepoRemotes(p: string) {
    const fullPath = await this.getFullPath(p);

    return await git.listRemotes({ fs, dir: fullPath });
  }

  async gitResolveFile(p: string, filepath: string) {
    const fullPath = await this.getFullPath(p);
    return await git.status({
      fs,
      dir: fullPath,
      filepath,
    });
  }

  async gitRemove(p: string, filepath: string) {
    const fullPath = await this.getFullPath(p);

    await git.remove({
      fs,
      dir: fullPath,
      filepath: filepath,
    });
  }

  async gitAdd(p: string, filepath: string) {
    const fullPath = await this.getFullPath(p);
    await git.add({
      fs,
      dir: fullPath,
      filepath,
    });
  }

  async gitResetIndex(p: string, filepath: string) {
    const fullPath = await this.getFullPath(p);

    await git.resetIndex({
      fs,
      dir: fullPath,
      filepath,
    });
  }

  async getStashStatus(p: string) {
    const fullPath = await this.getFullPath(p);

    const raw = await git.walk({
      fs,
      dir: fullPath,
      trees: [git.TREE({ ref: 'HEAD' }), git.TREE({ ref: 'refs/stash' })],

      map: async (filepath: string, [left, right]: any) => {
        if (filepath === '.') return undefined;

        const [lt, rt] = await Promise.all([left?.type?.(), right?.type?.()]);

        const isBlobLeft = lt === 'blob';
        const isBlobRight = rt === 'blob';
        if (!isBlobLeft && !isBlobRight) return undefined;

        const [lOid, rOid] = await Promise.all([left?.oid?.(), right?.oid?.()]);

        if (!left && right) return { path: filepath, change: 'added' as const };
        if (left && !right)
          return { path: filepath, change: 'deleted_staged' as const };
        if (left && right && lOid !== rOid) {
          return { path: filepath, change: 'modified' as const };
        }
        return undefined;
      },
    });

    return raw.map((file: any) => ({
      name: file.path,
      status: file.change,
    }));
  }
}
