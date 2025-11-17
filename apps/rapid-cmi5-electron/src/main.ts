import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import App from './app/app';
import path from 'path';
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import { ElectronFsHandler } from './app/api/fileSystem/fileSystem';

import { app } from 'electron';
import { cmi5Builder } from './app/api/cmi5Builder/build';
import JSZip from 'jszip';
import { FolderStruct } from '@rangeos-nx/cmi5-build/common';

const builder = new cmi5Builder();
// Instantiate and expose via IPC
const fsHandler = new ElectronFsHandler();

ipcMain.handle('fs:writeFile', async (_e, path, data) =>
  fsHandler.writeFile(path, data),
);
ipcMain.handle('fs:readFile', async (_e, path) => fsHandler.readFile(path));

ipcMain.handle('fs:stat', async (_e, path) => fsHandler.stat(path));

ipcMain.handle('fs:exists', async (_e, path) => fsHandler.exists(path));

ipcMain.handle(
  'fs:cloneRepo',
  async (_e, dir, url, branch, shallowClone, username, password) =>
    fsHandler.cloneRepo(dir, url, branch, shallowClone, username, password),
);

ipcMain.handle('fs:pullRepo', async (_e, dir, branch, username, password) =>
  fsHandler.pullRepo(dir, branch, username, password),
);

ipcMain.handle('fs:pushRepo', async (_e, dir, username, password) =>
  fsHandler.pushRepo(dir, username, password),
);
ipcMain.handle('fs:gitCommit', async (_e, dir, message, name, email) =>
  fsHandler.gitCommit(dir, message, name, email),
);

ipcMain.handle('fs:getStashStatus', async (_e, path) =>
  fsHandler.getStashStatus(path),
);

ipcMain.handle('fs:getStatus', async (_e, path) => fsHandler.getStatus(path));

ipcMain.handle('fs:gitInitRepo', async (_e, path, defaultBranch) =>
  fsHandler.gitInitRepo(path, defaultBranch),
);

ipcMain.handle('fs:listRepoRemotes', async (_e, path) =>
  fsHandler.listRepoRemotes(path),
);

ipcMain.handle('fs:getCurrentBranch', async (_e, path) =>
  fsHandler.getCurrentBranch(path),
);

ipcMain.handle('fs:getAllGitBranches', async (_e, path) =>
  fsHandler.getAllGitBranches(path),
);

ipcMain.handle('fs:getGitConfig', async (_e, path, configPath) =>
  fsHandler.getGitConfig(path, configPath),
);

ipcMain.handle('fs:setGitConfig', async (_e, path, configPath, value) =>
  fsHandler.setGitConfig(path, configPath, value),
);

ipcMain.handle('fs:gitCheckout', async (_e, path, branch) =>
  fsHandler.gitCheckout(path, branch),
);

ipcMain.handle('fs:gitAddRemote', async (_e, path, remoteUrl) =>
  fsHandler.gitAddRemote(path, remoteUrl),
);

ipcMain.handle('fs:gitAdd', async (_e, path, filePath) =>
  fsHandler.gitAdd(path, filePath),
);
ipcMain.handle('fs:gitRemove', async (_e, path, filePath) =>
  fsHandler.gitRemove(path, filePath),
);
ipcMain.handle('fs:gitWriteRef', async (_e, path, branch, commitHash) =>
  fsHandler.gitWriteRef(path, branch, commitHash),
);

ipcMain.handle('fs:revertFileToHEAD', async (_e, path, filePath) =>
  fsHandler.revertFileToHEAD(path, filePath),
);
ipcMain.handle(
  'fs:getFolderStructure',
  async (_e, dir, repoPath, getContents) =>
    fsHandler.getFolderStructure(dir, repoPath, getContents),
);

ipcMain.handle('fs:gitLog', async (_e, path) => fsHandler.gitLog(path));

ipcMain.handle('fs:gitResetIndex', async (_e, path, relFilePath) =>
  fsHandler.gitResetIndex(path, relFilePath),
);
ipcMain.handle('fs:gitResolveFile', async (_e, path, relFilePath) =>
  fsHandler.gitResolveFile(path, relFilePath),
);
ipcMain.handle('fs:gitStash', async (_e, path, op) =>
  fsHandler.gitStash(path, op),
);

ipcMain.handle('fs:gitResolveRef', async (_e, path, branch) =>
  fsHandler.gitResolveRef(path, branch),
);

ipcMain.handle('fs:copyFile', async (_e, src, dest) =>
  fsHandler.copyFile(src, dest),
);
ipcMain.handle('fs:rm', async (_e, path, recursive) =>
  fsHandler.rm(path, recursive),
);

ipcMain.handle('fs:mkdir', async (_e, path, recursive) =>
  fsHandler.mkdir(path, recursive),
);

ipcMain.handle('fs:rename', async (_e, oldpath, newpath) =>
  fsHandler.rm(oldpath, newpath),
);

ipcMain.handle('fs:readdir', async (_e, path) => fsHandler.readdir(path));

ipcMain.handle(
  'cmi5Build',
  async (_evt, projectPath, courseFolder, projectName) => {
    const zip = new JSZip();
    const courseRoot = zip.folder(courseFolder);
    const coursePath = path.join(projectPath, courseFolder);

    const folderStruct = await fsHandler.getFolderStructure(
      coursePath,
      projectPath,
      true,
      true,
    );

    if (!courseRoot) return;

    fillZip(folderStruct, courseRoot);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const tempPath = await builder.buildZip(zipBuffer, projectName);

    if (tempPath == null) return;
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save CMI5 package',
      defaultPath: path.join(app.getPath('downloads'), projectName),
      filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
    });
    if (canceled || !filePath) return { canceled: true };

    await (async () => {
      const fs = await import('fs');
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await finished(
        fs.createReadStream(tempPath).pipe(createWriteStream(filePath)),
      );
    })();

    shell.showItemInFolder(filePath);
    return { canceled: false, filePath };
  },
);

export default class Main {
  static initialize() {
    if (SquirrelEvents.handleEvents()) {
      // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
      app.quit();
    }
  }

  static bootstrapApp() {
    App.main(app, BrowserWindow);
  }

  static bootstrapAppEvents() {
    ElectronEvents.bootstrapElectronEvents();

    // initialize auto updater service
    if (!App.isDevelopmentMode()) {
      // UpdateEvents.initAutoUpdateService();
    }
  }
}

export function fillZip(folderStruct: FolderStruct[], zip: JSZip) {
  for (const item of folderStruct) {
    if (item.isBranch) {
      const subZip = zip.folder(item.name);
      if (subZip && item.children) {
        fillZip(item.children, subZip);
      }
    } else {
      if (!item.content) {
        continue;
      }
      zip.file(item.name, item.content);
    }
  }
}

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();
