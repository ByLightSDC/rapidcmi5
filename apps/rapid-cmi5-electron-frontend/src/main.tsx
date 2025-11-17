import * as ReactDOM from 'react-dom/client';
import AppWrapper from './app/AppWrapper';
import { config } from '@rangeos-nx/frontend/environment';
import { worker } from './mocks/browser';
import { http } from 'msw';
import { store } from './app/redux/store';
import * as git from 'isomorphic-git';

import './styles.css';
import './assets/fonts/stylesheet.css';

import { debugLog } from '@rangeos-nx/ui/branded';
import { DirEntry } from './app/views/dashboards/design-tools/course-builder/GitViewer/utils/ElectronFsApi';
import { ModifiedFile } from './app/views/dashboards/design-tools/course-builder/GitViewer/Components/GitActions/GitFileStatus';
import { FolderStruct } from '@rangeos-nx/cmi5-build/common';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    msw: any;
    store: any;
    ipc: {
      cmi5Build: (projectPath: string, courseFolder: string, projectName: string) => Promise<string>;
    };
    fsApi: {
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
      getStatus: (path: string) => Promise<git.StatusRow[]>;
      getStashStatus: (path: string) => Promise<ModifiedFile[]>;
      gitInitRepo: (dir: string, defaultBranch: string) => Promise<void>;
      gitLog: (dir: string) => Promise<git.ReadCommitResult[]>;
      getFolderStructure: (
        dir: string,
        repoPath: string,
        getContents: boolean
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

      pushRepo: (
        dir: string,
        username: string,
        password: string,
      ) => Promise<void>;
    };
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // this merges with the existing intrinsic elements, adding 'my-custom-tag' and its props
    interface IntrinsicElements {
      mytag: { title: string; children: any };
    }
  }
}

// Expose methods globally to make them available in integration tests
async function enableMocking() {
  if (config.CYPRESS === true) {
    window.store = store;
  }

  if (config.MSW_MOCK === true) {
    debugLog('[main]  MOCK ', true);
    window.msw = { worker, http };
    return worker.start();
  }

  return Promise.resolve();
}

// wait for MSW set up before render
enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );
  root.render(<AppWrapper />);
});
