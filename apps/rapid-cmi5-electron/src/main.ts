import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import App from './app/app';
import * as nodePath from 'path'; // Renamed to avoid conflicts
import { finished, pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { ElectronFsHandler, resolveSafe } from './app/api/fileSystem/fileSystem';

import { app } from 'electron';
import { cmi5Builder } from './app/api/cmi5Builder/build';
import fs from 'fs';

const builder = new cmi5Builder();
let fsHandler: ElectronFsHandler | null = null;

function getFsHandler() {
  if (!fsHandler) {
    const isTestMode = App.isTestMode();
    fsHandler = new ElectronFsHandler(isTestMode);
  }
  return fsHandler;
}

// File System Operations
ipcMain.handle('fs:writeFile', async (_e, filePath: string, data: any) => {
  try {
    return await getFsHandler().writeFile(filePath, data);
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

ipcMain.handle('fs:readFile', async (_e, filePath: string) => {
  try {
    return await getFsHandler().readFile(filePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('fs:stat', async (_e, filePath: string) => {
  try {
    return await getFsHandler().stat(filePath);
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw error;
  }
});

ipcMain.handle('fs:exists', async (_e, filePath: string) => {
  try {
    return await getFsHandler().exists(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    throw error;
  }
});

// Git Operations
ipcMain.handle(
  'fs:cloneRepo',
  async (
    _e,
    repoPath: string,
    url: string,
    branch: string,
    shallowClone: boolean,
    username: string,
    password: string,
  ) => {
    try {
      return await getFsHandler().cloneRepo(repoPath, url, branch, shallowClone, username, password);
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:pullRepo', async (_e, repoPath: string, branch: string, username: string, password: string) => {
  try {
    return await getFsHandler().pullRepo(repoPath, branch, username, password);
  } catch (error) {
    console.error('Error pulling repository:', error);
    throw error;
  }
});

ipcMain.handle('fs:pushRepo', async (_e, repoPath: string, username: string, password: string) => {
  try {
    return await getFsHandler().pushRepo(repoPath, username, password);
  } catch (error) {
    console.error('Error pushing repository:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitCommit', async (_e, repoPath: string, message: string, name: string, email: string) => {
  try {
    return await getFsHandler().gitCommit(repoPath, message, name, email);
  } catch (error) {
    console.error('Error committing changes:', error);
    throw error;
  }
});

ipcMain.handle('fs:getStashStatus', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().getStashStatus(repoPath);
  } catch (error) {
    console.error('Error getting stash status:', error);
    throw error;
  }
});

ipcMain.handle('fs:getStatus', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().getStatus(repoPath);
  } catch (error) {
    console.error('Error getting git status:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitInitRepo', async (_e, repoPath: string, defaultBranch: string) => {
  try {
    return await getFsHandler().gitInitRepo(repoPath, defaultBranch);
  } catch (error) {
    console.error('Error initializing repository:', error);
    throw error;
  }
});

ipcMain.handle('fs:listRepoRemotes', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().listRepoRemotes(repoPath);
  } catch (error) {
    console.error('Error listing remotes:', error);
    throw error;
  }
});

ipcMain.handle('fs:getCurrentBranch', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().getCurrentBranch(repoPath);
  } catch (error) {
    console.error('Error getting current branch:', error);
    throw error;
  }
});

ipcMain.handle('fs:getAllGitBranches', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().getAllGitBranches(repoPath);
  } catch (error) {
    console.error('Error getting all branches:', error);
    throw error;
  }
});

ipcMain.handle('fs:getGitConfig', async (_e, repoPath: string, configPath: string) => {
  try {
    return await getFsHandler().getGitConfig(repoPath, configPath);
  } catch (error) {
    console.error('Error getting git config:', error);
    throw error;
  }
});

ipcMain.handle('fs:setGitConfig', async (_e, repoPath: string, configPath: string, value: string) => {
  try {
    return await getFsHandler().setGitConfig(repoPath, configPath, value);
  } catch (error) {
    console.error('Error setting git config:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitCheckout', async (_e, repoPath: string, branch: string) => {
  try {
    return await getFsHandler().gitCheckout(repoPath, branch);
  } catch (error) {
    console.error('Error checking out branch:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitAddRemote', async (_e, repoPath: string, remoteUrl: string) => {
  try {
    return await getFsHandler().gitAddRemote(repoPath, remoteUrl);
  } catch (error) {
    console.error('Error adding remote:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitAdd', async (_e, repoPath: string, filePath: string) => {
  try {
    return await getFsHandler().gitAdd(repoPath, filePath);
  } catch (error) {
    console.error('Error adding file to git:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitRemove', async (_e, repoPath: string, filePath: string) => {
  try {
    return await getFsHandler().gitRemove(repoPath, filePath);
  } catch (error) {
    console.error('Error removing file from git:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitWriteRef', async (_e, repoPath: string, branch: string, commitHash: string) => {
  try {
    return await getFsHandler().gitWriteRef(repoPath, branch, commitHash);
  } catch (error) {
    console.error('Error writing git ref:', error);
    throw error;
  }
});

ipcMain.handle('fs:revertFileToHEAD', async (_e, repoPath: string, filePath: string) => {
  try {
    return await getFsHandler().revertFileToHEAD(repoPath, filePath);
  } catch (error) {
    console.error('Error reverting file:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:getFolderStructure',
  async (_e, dir: string, repoPath: string, getContents: boolean, includeGitIgnored?: boolean) => {
    try {
      return await getFsHandler().getFolderStructure(dir, repoPath, getContents, includeGitIgnored);
    } catch (error) {
      console.error('Error getting folder structure:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:gitLog', async (_e, repoPath: string) => {
  try {
    return await getFsHandler().gitLog(repoPath);
  } catch (error) {
    console.error('Error getting git log:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitResetIndex', async (_e, repoPath: string, relFilePath: string) => {
  try {
    return await getFsHandler().gitResetIndex(repoPath, relFilePath);
  } catch (error) {
    console.error('Error resetting index:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitResolveFile', async (_e, repoPath: string, relFilePath: string) => {
  try {
    return await getFsHandler().gitResolveFile(repoPath, relFilePath);
  } catch (error) {
    console.error('Error resolving file:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitStash', async (_e, repoPath: string, op: 'list' | 'pop' | 'push') => {
  try {
    return await getFsHandler().gitStash(repoPath, op);
  } catch (error) {
    console.error('Error with git stash:', error);
    throw error;
  }
});

ipcMain.handle('fs:gitResolveRef', async (_e, repoPath: string, branch: string) => {
  try {
    return await getFsHandler().gitResolveRef(repoPath, branch);
  } catch (error) {
    console.error('Error resolving ref:', error);
    throw error;
  }
});

// File System Operations (continued)
ipcMain.handle('fs:copyFile', async (_e, src: string, dest: string) => {
  try {
    return await getFsHandler().copyFile(src, dest);
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
});

ipcMain.handle('fs:rm', async (_e, filePath: string, recursive: boolean) => {
  try {
    return await getFsHandler().rm(filePath, recursive);
  } catch (error) {
    console.error('Error removing file/directory:', error);
    throw error;
  }
});

ipcMain.handle('fs:mkdir', async (_e, dirPath: string, recursive: boolean) => {
  try {
    return await getFsHandler().mkdir(dirPath, recursive);
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
});

ipcMain.handle('fs:rename', async (_e, oldPath: string, newPath: string) => {
  try {
    return await getFsHandler().rename(oldPath, newPath);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
});

ipcMain.handle('fs:readdir', async (_e, dirPath: string) => {
  try {
    return await getFsHandler().readdir(dirPath);
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});

// CMI5 Build Handler
ipcMain.handle('cmi5Build', async (_evt, projectPath: string, courseFolder: string, projectName: string) => {
  const coursePath = nodePath.join(projectPath, courseFolder);
  const folderStruct = await getFsHandler().getFolderStructure(coursePath, coursePath, true, true);
  const coursePathAbsolute = resolveSafe(coursePath, false);

  const tempPath = await builder.buildZip(coursePathAbsolute, folderStruct, projectName, courseFolder);
  if (tempPath === null) return { success: false, canceled: false };

  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save CMI5 package',
      defaultPath: nodePath.join(app.getPath('downloads'), `${projectName}`),
      filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    await fs.promises.mkdir(nodePath.dirname(filePath), { recursive: true });
    await pipeline(fs.createReadStream(tempPath), fs.createWriteStream(filePath));
    shell.showItemInFolder(filePath);

    return { success: true, canceled: false, filePath };
  } finally {
    await fs.promises.rm(tempPath, { force: true }).catch((err) => {
      console.warn('Failed to remove temp build file:', err);
    });
  }
});

export default class Main {
  static initialize() {
    if (SquirrelEvents.handleEvents()) {
      app.quit();
    }
  }

  static bootstrapApp() {
    App.main(app, BrowserWindow);
  }

  static bootstrapAppEvents() {
    ElectronEvents.bootstrapElectronEvents();

    if (!App.isDevelopmentMode()) {
      // UpdateEvents.initAutoUpdateService();
    }
  }
}

Main.initialize();
Main.bootstrapApp();
Main.bootstrapAppEvents();
