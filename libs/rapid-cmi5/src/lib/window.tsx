import { FolderStruct } from '@rapid-cmi5/cmi5-build/common';
import { ModifiedFile } from './design-tools/course-builder/GitViewer/Components/GitActions/GitFileStatus';
import { DirEntry } from './design-tools/course-builder/GitViewer/utils/ElectronFsApi';
import { ReadCommitResult, StatusRow } from 'isomorphic-git';

export interface ipc {
  cmi5Build: (
    projectPath: string,
    courseFolder: string,
    projectName: string,
  ) => Promise<string>;
}

export interface fsApi {
  writeFile: (
    path: string,
    data: string | ArrayBuffer | Uint8Array | Blob,
  ) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  getCurrentBranch: (path: string) => Promise<string | void>;
  gitCheckout: (path: string, branch: string) => Promise<void>;
  gitAdd: (path: string, filePath: string) => Promise<void>;
  gitRemove: (path: string, filePath: string) => Promise<void>;
  gitAddRemote: (path: string, remoteUrl: string) => Promise<void>;
  getGitConfig: (path: string, configPath: string) => Promise<any>;
  setGitConfig: (
    path: string,
    configPath: string,
    value: string,
  ) => Promise<void>;

  gitWriteRef: (
    path: string,
    branch: string,
    commitHash: string,
  ) => Promise<void>;

  getAllGitBranches: (path: string) => Promise<string[]>;
  stat: (path: string) => Promise<{
    isSymbolicLink: boolean;
    size: number;
    mtimeMs: number;
    isFile: boolean;
    isDirectory: boolean;
    path: string;
    ctimeMs: number;
    mode: number;
  }>;
  exists: (path: string) => Promise<boolean>;
  copyFile: (src: string, dest: string) => Promise<void>;
  rm: (path: string, recursive?: boolean) => Promise<void>;
  rename: (oldpath: string, newpath: string) => Promise<void>;
  mkdir: (path: string, recursive?: boolean) => Promise<void>;
  readdir: (path: string) => Promise<DirEntry[]>;
  getStatus: (path: string) => Promise<StatusRow[]>;
  getStashStatus: (path: string) => Promise<ModifiedFile[]>;
  gitInitRepo: (dir: string, defaultBranch: string) => Promise<void>;
  gitLog: (dir: string) => Promise<ReadCommitResult[]>;
  getFolderStructure: (
    dir: string,
    repoPath: string,
    getContents: boolean,
  ) => Promise<FolderStruct[]>;
  gitStash: (
    dir: string,
    op: 'list' | 'pop' | 'push',
  ) => Promise<string | void>;
  gitCommit: (
    dir: string,
    message: string,
    committerName: string,
    committerEmail: string,
  ) => Promise<void>;
  gitResetIndex: (dir: string, relFilePath: string) => Promise<void>;
  gitResolveFile: (
    dir: string,
    relFilePath: string,
  ) => Promise<
    | 'ignored'
    | 'unmodified'
    | '*modified'
    | '*deleted'
    | '*added'
    | 'absent'
    | 'modified'
    | 'deleted'
    | 'added'
    | '*unmodified'
    | '*absent'
    | '*undeleted'
    | '*undeletemodified'
  >;

  listRepoRemotes: (dir: string) => Promise<
    Array<{
      remote: string;
      url: string;
    }>
  >;
  gitResolveRef: (dir: string, branch: string) => Promise<string>;
  revertFileToHEAD: (dir: string, filePath: string) => Promise<string>;
  cloneRepo: (
    dir: string,
    url: string,
    branch: string,
    shallowClone: boolean,
    username: string,
    password: string,
  ) => Promise<void>;

  pullRepo: (
    dir: string,
    branch: string,
    username: string,
    password: string,
  ) => Promise<void>;

  pushRepo: (dir: string, username: string, password: string) => Promise<void>;
}

declare global {
  interface Window {
    ipc: ipc;
    fsApi: fsApi;
  }
}
