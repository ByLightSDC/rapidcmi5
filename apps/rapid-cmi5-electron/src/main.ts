import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import App from './app/app';
import * as nodePath from 'path'; // Renamed to avoid conflicts
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import { ElectronFsHandler } from './app/api/fileSystem/fileSystem';

import { app } from 'electron';
import { cmi5Builder } from './app/api/cmi5Builder/build';
import JSZip from 'jszip';
import { FolderStruct } from '@rapid-cmi5/cmi5-build/common';

const builder = new cmi5Builder();
const isTestMode = App.isTestMode();
const fsHandler = new ElectronFsHandler(isTestMode);

// File System Operations
ipcMain.handle('fs:writeFile', async (_e, filePath: string, data: any) => {
  try {
    return await fsHandler.writeFile(filePath, data);
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

ipcMain.handle('fs:readFile', async (_e, filePath: string) => {
  try {
    return await fsHandler.readFile(filePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('fs:stat', async (_e, filePath: string) => {
  try {
    return await fsHandler.stat(filePath);
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw error;
  }
});

ipcMain.handle('fs:exists', async (_e, filePath: string) => {
  try {
    return await fsHandler.exists(filePath);
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
      return await fsHandler.cloneRepo(
        repoPath,
        url,
        branch,
        shallowClone,
        username,
        password,
      );
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:pullRepo',
  async (
    _e,
    repoPath: string,
    branch: string,
    username: string,
    password: string,
  ) => {
    try {
      return await fsHandler.pullRepo(repoPath, branch, username, password);
    } catch (error) {
      console.error('Error pulling repository:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:pushRepo',
  async (_e, repoPath: string, username: string, password: string) => {
    try {
      return await fsHandler.pushRepo(repoPath, username, password);
    } catch (error) {
      console.error('Error pushing repository:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitCommit',
  async (
    _e,
    repoPath: string,
    message: string,
    name: string,
    email: string,
  ) => {
    try {
      return await fsHandler.gitCommit(repoPath, message, name, email);
    } catch (error) {
      console.error('Error committing changes:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:getStashStatus', async (_e, repoPath: string) => {
  try {
    return await fsHandler.getStashStatus(repoPath);
  } catch (error) {
    console.error('Error getting stash status:', error);
    throw error;
  }
});

ipcMain.handle('fs:getStatus', async (_e, repoPath: string) => {
  try {
    return await fsHandler.getStatus(repoPath);
  } catch (error) {
    console.error('Error getting git status:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:gitInitRepo',
  async (_e, repoPath: string, defaultBranch: string) => {
    try {
      return await fsHandler.gitInitRepo(repoPath, defaultBranch);
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:listRepoRemotes', async (_e, repoPath: string) => {
  try {
    return await fsHandler.listRepoRemotes(repoPath);
  } catch (error) {
    console.error('Error listing remotes:', error);
    throw error;
  }
});

ipcMain.handle('fs:getCurrentBranch', async (_e, repoPath: string) => {
  try {
    return await fsHandler.getCurrentBranch(repoPath);
  } catch (error) {
    console.error('Error getting current branch:', error);
    throw error;
  }
});

ipcMain.handle('fs:getAllGitBranches', async (_e, repoPath: string) => {
  try {
    return await fsHandler.getAllGitBranches(repoPath);
  } catch (error) {
    console.error('Error getting all branches:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:getGitConfig',
  async (_e, repoPath: string, configPath: string) => {
    try {
      return await fsHandler.getGitConfig(repoPath, configPath);
    } catch (error) {
      console.error('Error getting git config:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:setGitConfig',
  async (_e, repoPath: string, configPath: string, value: string) => {
    try {
      return await fsHandler.setGitConfig(repoPath, configPath, value);
    } catch (error) {
      console.error('Error setting git config:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitCheckout',
  async (_e, repoPath: string, branch: string) => {
    try {
      return await fsHandler.gitCheckout(repoPath, branch);
    } catch (error) {
      console.error('Error checking out branch:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitAddRemote',
  async (_e, repoPath: string, remoteUrl: string) => {
    try {
      return await fsHandler.gitAddRemote(repoPath, remoteUrl);
    } catch (error) {
      console.error('Error adding remote:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:gitAdd', async (_e, repoPath: string, filePath: string) => {
  try {
    return await fsHandler.gitAdd(repoPath, filePath);
  } catch (error) {
    console.error('Error adding file to git:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:gitRemove',
  async (_e, repoPath: string, filePath: string) => {
    try {
      return await fsHandler.gitRemove(repoPath, filePath);
    } catch (error) {
      console.error('Error removing file from git:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitWriteRef',
  async (_e, repoPath: string, branch: string, commitHash: string) => {
    try {
      return await fsHandler.gitWriteRef(repoPath, branch, commitHash);
    } catch (error) {
      console.error('Error writing git ref:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:revertFileToHEAD',
  async (_e, repoPath: string, filePath: string) => {
    try {
      return await fsHandler.revertFileToHEAD(repoPath, filePath);
    } catch (error) {
      console.error('Error reverting file:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:getFolderStructure',
  async (
    _e,
    dir: string,
    repoPath: string,
    getContents: boolean,
    includeGitIgnored?: boolean,
  ) => {
    try {
      return await fsHandler.getFolderStructure(
        dir,
        repoPath,
        getContents,
        includeGitIgnored,
      );
    } catch (error) {
      console.error('Error getting folder structure:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:gitLog', async (_e, repoPath: string) => {
  try {
    return await fsHandler.gitLog(repoPath);
  } catch (error) {
    console.error('Error getting git log:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:gitResetIndex',
  async (_e, repoPath: string, relFilePath: string) => {
    try {
      return await fsHandler.gitResetIndex(repoPath, relFilePath);
    } catch (error) {
      console.error('Error resetting index:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitResolveFile',
  async (_e, repoPath: string, relFilePath: string) => {
    try {
      return await fsHandler.gitResolveFile(repoPath, relFilePath);
    } catch (error) {
      console.error('Error resolving file:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitStash',
  async (_e, repoPath: string, op: 'list' | 'pop' | 'push') => {
    try {
      return await fsHandler.gitStash(repoPath, op);
    } catch (error) {
      console.error('Error with git stash:', error);
      throw error;
    }
  },
);

ipcMain.handle(
  'fs:gitResolveRef',
  async (_e, repoPath: string, branch: string) => {
    try {
      return await fsHandler.gitResolveRef(repoPath, branch);
    } catch (error) {
      console.error('Error resolving ref:', error);
      throw error;
    }
  },
);

// File System Operations (continued)
ipcMain.handle('fs:copyFile', async (_e, src: string, dest: string) => {
  try {
    return await fsHandler.copyFile(src, dest);
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
});

ipcMain.handle('fs:rm', async (_e, filePath: string, recursive: boolean) => {
  try {
    return await fsHandler.rm(filePath, recursive);
  } catch (error) {
    console.error('Error removing file/directory:', error);
    throw error;
  }
});

ipcMain.handle('fs:mkdir', async (_e, dirPath: string, recursive: boolean) => {
  try {
    return await fsHandler.mkdir(dirPath, recursive);
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
});

ipcMain.handle('fs:rename', async (_e, oldPath: string, newPath: string) => {
  try {
    return await fsHandler.rename(oldPath, newPath);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
});

ipcMain.handle('fs:readdir', async (_e, dirPath: string) => {
  try {
    return await fsHandler.readdir(dirPath);
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});

// CMI5 Build Handler
ipcMain.handle(
  'cmi5Build',
  async (
    _evt,
    projectPath: string,
    courseFolder: string,
    projectName: string,
  ) => {
    try {
      const zip = new JSZip();
      const courseRoot = zip.folder(courseFolder);

      if (!courseRoot) {
        throw new Error('Failed to create course folder in zip');
      }

      const coursePath = nodePath.join(projectPath, courseFolder);

      const folderStruct = await fsHandler.getFolderStructure(
        coursePath,
        projectPath,
        true,
        true,
      );

      fillZip(folderStruct, courseRoot);

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const tempPath = await builder.buildZip(zipBuffer, projectName);

      if (tempPath == null) {
        throw new Error('Failed to build zip package');
      }

      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Save CMI5 package',
        defaultPath: nodePath.join(app.getPath('downloads'), projectName),
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
      });

      if (canceled || !filePath) {
        return { canceled: true };
      }

      const fs = await import('fs');
      await fs.promises.mkdir(nodePath.dirname(filePath), { recursive: true });
      await finished(
        fs.createReadStream(tempPath).pipe(createWriteStream(filePath)),
      );

      shell.showItemInFolder(filePath);
      return { canceled: false, filePath };
    } catch (error) {
      console.error('Error building CMI5 package:', error);
      throw error;
    }
  },
);

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

export function fillZip(folderStruct: FolderStruct[], zip: JSZip) {
  for (const item of folderStruct) {
    if (item.isBranch) {
      const subZip = zip.folder(item.name);
      if (subZip && item.children) {
        fillZip(item.children, subZip);
      }
    } else {
      if (item.content) {
        zip.file(item.name, item.content);
      }
    }
  }
}

Main.initialize();
Main.bootstrapApp();
Main.bootstrapAppEvents();
