import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

export const ipc = {
  cmi5Build: (projectPath: string, courseFolder: string, projectName: string) =>
    ipcRenderer.invoke('cmi5Build', projectPath, courseFolder, projectName),
};

contextBridge.exposeInMainWorld('ipc', ipc);

export const fsApi = {
  writeFile: async (
    path: string,
    data: string | ArrayBuffer | Uint8Array | Blob,
  ) => ipcRenderer.invoke('fs:writeFile', path, await normalizeData(data)),
  readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
  stat: (path: string) => ipcRenderer.invoke('fs:stat', path),
  exists: (path: string) => ipcRenderer.invoke('fs:exists', path),
  copyFile: (src: string, dest: string) =>
    ipcRenderer.invoke('fs:copyFile', src, dest),
  rm: (path: string, recursive = false) =>
    ipcRenderer.invoke('fs:rm', path, recursive),
  rename: (oldpath: string, newpath: string) =>
    ipcRenderer.invoke('fs:rename', oldpath, newpath),
  mkdir: (path: string, recursive = false) =>
    ipcRenderer.invoke('fs:mkdir', path, recursive),
  readdir: (path: string) => ipcRenderer.invoke('fs:readdir', path),
  gitInitRepo: (path: string, defaultBranch: string) =>
    ipcRenderer.invoke('fs:gitInitRepo', path, defaultBranch),
  gitLog: (path: string) => ipcRenderer.invoke('fs:gitLog', path),
  gitStash: (path: string, op: 'list' | 'pop' | 'push') =>
    ipcRenderer.invoke('fs:gitStash', path, op),
  gitResetIndex: (path: string, relFilePath: string) =>
    ipcRenderer.invoke('fs:gitResetIndex', path, relFilePath),
  gitResolveRef: (path: string, branch: string) =>
    ipcRenderer.invoke('fs:gitResolveRef', path, branch),
  getCurrentBranch: (path: string) =>
    ipcRenderer.invoke('fs:getCurrentBranch', path),
  getGitConfig: (path: string, configPath: string) =>
    ipcRenderer.invoke('fs:getGitConfig', path, configPath),
  setGitConfig: (path: string, configPath: string, value: string) =>
    ipcRenderer.invoke('fs:setGitConfig', path, configPath, value),
  gitCheckout: (path: string, branch: string) =>
    ipcRenderer.invoke('fs:gitCheckout', path, branch),
  gitAdd: (path: string, filePath: string) =>
    ipcRenderer.invoke('fs:gitAdd', path, filePath),
  gitWriteRef: (path: string, branch: string, commitHash: string) =>
    ipcRenderer.invoke('fs:gitWriteRef', path, branch, commitHash),
  revertFileToHEAD: (path: string, filePath: string) =>
    ipcRenderer.invoke('fs:revertFileToHEAD', path, filePath),
  gitRemove: (path: string, filePath: string) =>
    ipcRenderer.invoke('fs:gitRemove', path, filePath),
  gitAddRemote: (path: string, remoteUrl: string) =>
    ipcRenderer.invoke('fs:gitAddRemote', path, remoteUrl),
  getAllGitBranches: (path: string) =>
    ipcRenderer.invoke('fs:getAllGitBranches', path),
  listRepoRemotes: (path: string) =>
    ipcRenderer.invoke('fs:listRepoRemotes', path),
  gitResolveFile: (path: string, relFilePath: string) =>
    ipcRenderer.invoke('fs:gitResolveFile', path, relFilePath),
  getFolderStructure: (dir: string, repoPath: string, getContents: boolean) =>
    ipcRenderer.invoke('fs:getFolderStructure', dir, repoPath, getContents),
  cloneRepo: (
    dir: string,
    url: string,
    branch: string,
    shallowClone: boolean,
    username: string,
    password: string,
  ) =>
    ipcRenderer.invoke(
      'fs:cloneRepo',
      dir,
      url,
      branch,
      shallowClone,
      username,
      password,
    ),
  gitCommit: (
    dir: string,
    message: string,
    committerName: string,
    committerEmail: string,
  ) =>
    ipcRenderer.invoke(
      'fs:gitCommit',
      dir,
      message,
      committerName,
      committerEmail,
    ),
  pushRepo: (dir: string, username: string, password: string) =>
    ipcRenderer.invoke('fs:pushRepo', dir, username, password),
  pullRepo: (dir: string, branch: string, username: string, password: string) =>
    ipcRenderer.invoke('fs:pullRepo', dir, branch, username, password),
  getStatus: (path: string) => ipcRenderer.invoke('fs:getStatus', path),
  getStashStatus: (path: string) =>
    ipcRenderer.invoke('fs:getStashStatus', path),
};
contextBridge.exposeInMainWorld('fsApi', fsApi);

async function normalizeData(data: any): Promise<string | Uint8Array> {
  if (typeof data === 'string') return data;
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (data instanceof Blob) {
    const ab = await data.arrayBuffer();
    return new Uint8Array(ab);
  }
  throw new Error('Unsupported data type for writeFile');
}
