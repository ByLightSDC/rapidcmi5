import {
  Credentials,
  GitUserConfig,
  SSOConfig,
} from '@rapid-cmi5/cmi5-build-common';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

// Allows us to use api calls to other servers getting a round CORS
contextBridge.exposeInMainWorld('electronAPI', {
  fetch: (opts: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }) => ipcRenderer.invoke('api:request', opts),
});

export const ipc = {
  cmi5Build: (
    projectPath: string,
    courseFolder: string,
    projectName: string,
    createAuMappings: boolean,
  ) =>
    ipcRenderer.invoke(
      'cmi5Build',
      projectPath,
      courseFolder,
      projectName,
      createAuMappings,
    ),
  testInPlayer: (auJson: string, playerUrl: string, configDestPath: string) =>
    ipcRenderer.invoke('cmi5:testInPlayer', auJson, playerUrl, configDestPath),
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
  chooseProject: () => ipcRenderer.invoke('fs:chooseProject'),
  getRecentProjects: () => ipcRenderer.invoke('fs:getRecentProjects'),
  removeRecentProject: (id: string) =>
    ipcRenderer.invoke('fs:removeRecentProject', id),
  addRecentProject: (id: string) =>
    ipcRenderer.invoke('fs:addRecentProject', id),
  readPlayerConfig: () => ipcRenderer.invoke('fs:readPlayerConfig'),
  writePlayerConfig: (content: string) =>
    ipcRenderer.invoke('fs:writePlayerConfig', content),
};
contextBridge.exposeInMainWorld('fsApi', fsApi);

export const userSettingsApi = {
  setSSOConfig: (data: SSOConfig) =>
    ipcRenderer.invoke('userSettingsApi:setSSOConfig', data),
  getSSOConfig: () => ipcRenderer.invoke('userSettingsApi:getSSOConfig'),
  setGitUserConfig: (data: GitUserConfig) =>
    ipcRenderer.invoke('userSettingsApi:setGitUserConfig', data),
  getGitUserConfig: () =>
    ipcRenderer.invoke('userSettingsApi:getGitUserConfig'),
  loginSSO: (refresh?: boolean) =>
    ipcRenderer.invoke('userSettingsApi:loginSSO', refresh),
  logoutSSO: () => ipcRenderer.invoke('userSettingsApi:logoutSSO'),
  getGitCredentials: () =>
    ipcRenderer.invoke('userSettingsApi:getGitCredentials'),
  setGitCredentials: (creds: Credentials) =>
    ipcRenderer.invoke('userSettingsApi:setGitCredentials', creds),
  setSSOCredentials: (creds: Credentials) =>
    ipcRenderer.invoke('userSettingsApi:setSSOCredentials', creds),
  listCerts: () => ipcRenderer.invoke('userSettingsApi:listCerts'),
  addCert: (filename: string, contents: string) =>
    ipcRenderer.invoke('userSettingsApi:addCert', filename, contents),
  removeCert: (id: string) =>
    ipcRenderer.invoke('userSettingsApi:removeCert', id),
};

contextBridge.exposeInMainWorld('userSettingsApi', userSettingsApi);

export interface ClaudeStartOptions {
  cwd?: string;
  args?: string[];
  command?: string;
  cols?: number;
  rows?: number;
}

export interface ClaudeDataPayload {
  sessionId: string;
  data: string;
  stream: 'stdout' | 'stderr';
}

export interface ClaudeExitPayload {
  sessionId: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}

export interface ClaudeErrorPayload {
  sessionId: string;
  message: string;
}

export type CodexStartOptions = ClaudeStartOptions;
export type CodexDataPayload = ClaudeDataPayload;
export type CodexExitPayload = ClaudeExitPayload;
export type CodexErrorPayload = ClaudeErrorPayload;

export const claudeApi = {
  start: (opts: ClaudeStartOptions = {}): Promise<{ sessionId: string }> =>
    ipcRenderer.invoke('claude:start', opts),
  input: (sessionId: string, data: string): Promise<void> =>
    ipcRenderer.invoke('claude:input', sessionId, data),
  resize: (sessionId: string, cols: number, rows: number): Promise<void> =>
    ipcRenderer.invoke('claude:resize', sessionId, cols, rows),
  stop: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('claude:stop', sessionId),
  onData: (handler: (payload: ClaudeDataPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeDataPayload) =>
      handler(payload);
    ipcRenderer.on('claude:data', listener);
    return () => ipcRenderer.removeListener('claude:data', listener);
  },
  onExit: (handler: (payload: ClaudeExitPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeExitPayload) =>
      handler(payload);
    ipcRenderer.on('claude:exit', listener);
    return () => ipcRenderer.removeListener('claude:exit', listener);
  },
  onError: (handler: (payload: ClaudeErrorPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeErrorPayload) =>
      handler(payload);
    ipcRenderer.on('claude:error', listener);
    return () => ipcRenderer.removeListener('claude:error', listener);
  },
};

contextBridge.exposeInMainWorld('claudeApi', claudeApi);

export const codexApi = {
  start: (opts: CodexStartOptions = {}): Promise<{ sessionId: string }> =>
    ipcRenderer.invoke('codex:start', opts),
  input: (sessionId: string, data: string): Promise<void> =>
    ipcRenderer.invoke('codex:input', sessionId, data),
  resize: (sessionId: string, cols: number, rows: number): Promise<void> =>
    ipcRenderer.invoke('codex:resize', sessionId, cols, rows),
  stop: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('codex:stop', sessionId),
  onData: (handler: (payload: CodexDataPayload) => void) => {
    const listener = (_e: unknown, payload: CodexDataPayload) =>
      handler(payload);
    ipcRenderer.on('codex:data', listener);
    return () => ipcRenderer.removeListener('codex:data', listener);
  },
  onExit: (handler: (payload: CodexExitPayload) => void) => {
    const listener = (_e: unknown, payload: CodexExitPayload) =>
      handler(payload);
    ipcRenderer.on('codex:exit', listener);
    return () => ipcRenderer.removeListener('codex:exit', listener);
  },
  onError: (handler: (payload: CodexErrorPayload) => void) => {
    const listener = (_e: unknown, payload: CodexErrorPayload) =>
      handler(payload);
    ipcRenderer.on('codex:error', listener);
    return () => ipcRenderer.removeListener('codex:error', listener);
  },
};

contextBridge.exposeInMainWorld('codexApi', codexApi);

export const terminalApi = {
  start: (opts: ClaudeStartOptions = {}): Promise<{ sessionId: string }> =>
    ipcRenderer.invoke('terminal:start', opts),
  input: (sessionId: string, data: string): Promise<void> =>
    ipcRenderer.invoke('terminal:input', sessionId, data),
  resize: (sessionId: string, cols: number, rows: number): Promise<void> =>
    ipcRenderer.invoke('terminal:resize', sessionId, cols, rows),
  stop: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('terminal:stop', sessionId),
  onData: (handler: (payload: ClaudeDataPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeDataPayload) =>
      handler(payload);
    ipcRenderer.on('terminal:data', listener);
    return () => ipcRenderer.removeListener('terminal:data', listener);
  },
  onExit: (handler: (payload: ClaudeExitPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeExitPayload) =>
      handler(payload);
    ipcRenderer.on('terminal:exit', listener);
    return () => ipcRenderer.removeListener('terminal:exit', listener);
  },
  onError: (handler: (payload: ClaudeErrorPayload) => void) => {
    const listener = (_e: unknown, payload: ClaudeErrorPayload) =>
      handler(payload);
    ipcRenderer.on('terminal:error', listener);
    return () => ipcRenderer.removeListener('terminal:error', listener);
  },
};

contextBridge.exposeInMainWorld('terminalApi', terminalApi);

export const electronEvents = {
  on: <T>(channel: string, handler: (data: T) => void) => {
    const listener = (_e: unknown, data: T) => handler(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  send: <T>(channel: string, data: T) => ipcRenderer.send(channel, data),
};

contextBridge.exposeInMainWorld('electronEvents', electronEvents);

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
