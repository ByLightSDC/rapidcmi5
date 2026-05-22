import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import UpdateEvents from './app/events/update.events';
import { BrowserWindow, dialog, ipcMain, net, shell } from 'electron';
import App from './app/app';
import path, * as nodePath from 'path'; // Renamed to avoid conflicts
import { pipeline } from 'stream/promises';
import {
  ElectronFsHandler,
  getRapidBase,
  resolveSafe,
} from './app/api/fileSystem/fileSystem';

import { app } from 'electron';
import { cmi5Builder } from './app/api/cmi5Builder/build';
import fs from 'fs';
import {
  Credentials,
  GitUserConfig,
  SSOConfig,
} from '@rapid-cmi5/cmi5-build-common';
import {
  decryptCredentials,
  encryptCredentials,
  decryptToken,
  encryptToken,
  logoutSSO,
  store,
  loginWithRefreshOrRedirect,
  loginSSORedirect,
} from './app/api/userSettings/sso';
import {
  applyCustomCerts,
  listCerts,
  addCert,
  removeCert,
} from './app/api/userSettings/certManager';
import {
  addRecentProject,
  removeRecentProject,
} from './app/api/userSettings/recentProjects';
import {
  inputToSession,
  resizeSession,
  startClaudeSession,
  startPtySession,
  stopAllSessionsForWebContents,
  stopSession,
  type StartOptions,
} from './app/api/claude/cli';
import { startCodexSession } from './app/api/codex/cli';
import { startMcp } from './app/api/mcp/main';

function defaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC ?? 'cmd.exe';
  }
  return process.env.SHELL ?? '/bin/bash';
}

function getLocalFsBase(): string {
  return path.join(getRapidBase(App.isTestMode()), 'localFileSystem');
}

const rapidCmi5AgentInstructions = `# RapidCMI5 Agent Notes

You are helping a course designer author CMI5 e-learning content in the
RapidCMI5 Electron app. The user is an instructional designer, not a
developer — they speak in lessons, slides, topics, audiences. Translate
their phrasing into the right tool calls; never make them think in
terms of filepaths or yaml.

## Data model

The workspace (your cwd) contains projects (top-level repo directories,
git-tracked). Each project contains one or more courses (directories
with an \`RC5.yaml\` manifest). The hierarchy:

    course → blocks → AUs (lessons) → slides

Most courses have a single block. Treat blocks as an organizational
detail; don't surface them to the user.

- \`coursePath\` is "\`<projectDir>/<courseDir>\`" (e.g. "test1-project/course-1").
- An AU's \`dirPath\` is unique within a course (filesystem-enforced).
- A slide's \`filepath\` is unique within a course AND is relative to
  the **project** dir, not the course dir. To read a slide with the
  host Read tool, prepend the project: "\`<projectDir>/<slide.filepath>\`".

## Workflow

1. **Discover before mutating.** Call \`rc5_get_course\` first whenever
   you plan to change content. This gives you the full structure plus
   the unique handles you'll need (dirPath, filepath).
2. **To fetch a slide's markdown body, use the host's Read tool**, not
   an MCP tool. The path is "\`<projectDir>/<slide.filepath>\`". There
   is intentionally no \`rc5_get_slide\` — Read is the right primitive.
3. **To mutate course content** (create a course, add a quiz, update
   slides, save), use the \`rc5_*\` tools. They call into the Electron
   renderer so the open Designer stays in sync. **Do not** write
   RC5.yaml or slide \`.md\` files directly with Write/Edit — the
   Designer's Redux state will diverge from disk and edits will be lost
   the next time the user saves.
4. **When the user's request is ambiguous** (e.g. multiple lessons or
   slides share the same title), ASK A CLARIFYING QUESTION. Do not
   guess. Show them the matches with enough context to pick.

## Authoring guidelines

- A lesson should have a clear learning objective written at an
  appropriate Bloom's-taxonomy level. Pick a verb that matches what
  the learner should be able to DO after the lesson:
    - **Remember:** identify, list, recall, recognize, name
    - **Understand:** describe, explain, summarize, classify, compare
    - **Apply:** implement, execute, use, demonstrate, solve
    - **Analyze:** differentiate, contrast, organize, attribute, deconstruct
    - **Evaluate:** judge, critique, defend, justify, assess
    - **Create:** design, construct, plan, produce, compose
  Avoid vague verbs like "know", "understand" (the level, fine; the
  verb, no), or "learn" — they aren't observable behaviors.
- Slide content is markdown. Available custom directives:
    - **Activities** (need JSON-fenced bodies): \`quiz\`, \`ctf\`,
      \`scenario\`, \`codeRunner\`, \`download\`, \`consoles\`.
    - **Call-outs** (markdown bodies): \`admonition\` (12 types — tip,
      warning, danger, note, info, example, question, quote, success,
      failure, abstract, bug).
    - **Layouts** (markdown bodies): \`gridContainer\` (side-by-side),
      \`accordion\` (collapsible), \`steps\` (sequential), \`tabs\`
      (alternative views), \`statements\` (visual statement list),
      \`quotes\` (attributed quotes), \`layout\` (flex container).
  **Activity directive bodies (quiz / ctf / scenario / codeRunner /
  download / consoles) MUST be a fenced JSON code block matching the
  directive's content schema — never bare YAML or plain text.**
  Before composing any directive, call
  \`rc5_get_directive_format(name)\` to fetch the exact schema and a
  worked example. Reach for layouts to break up long text slides:
  \`accordion\` for FAQ / optional depth, \`steps\` for procedures,
  \`tabs\` for alternatives, \`gridContainer\` for compare/contrast.
- Keep slides focused. One concept per slide; varied formats
  (explanation, example, check-for-understanding) across a lesson.
- For courses targeting compliance-driven training (military, gov,
  healthcare), tag content with KSAT codes when known.
`;

function toTomlString(value: string): string {
  return JSON.stringify(value);
}

function upsertCodexMcpConfig(config: string, url: string): string {
  const rapidCmi5Block = `[mcp_servers.rapidcmi5]\nurl = ${toTomlString(url)}\n`;
  const blockPattern =
    /(^|\n)\[mcp_servers\.rapidcmi5\]\n(?:[^\n]*\n)*(?=\n?\[|\s*$)/m;

  if (blockPattern.test(config)) {
    return `${config.replace(blockPattern, `$1${rapidCmi5Block}`).trimEnd()}\n`;
  }

  const prefix = config.trimEnd();
  return `${prefix ? `${prefix}\n\n` : ''}${rapidCmi5Block}`;
}

async function startMcpServer(): Promise<void> {
  const base = getLocalFsBase();
  await fs.promises.mkdir(base, { recursive: true });

  const { url } = await startMcp({
    rootDir: base,
    getMainWindow: () => App.mainWindow ?? null,
  });

  const mcpJson = {
    mcpServers: {
      rapidcmi5: {
        type: 'http',
        url,
      },
    },
  };
  await fs.promises.writeFile(
    path.join(base, '.mcp.json'),
    JSON.stringify(mcpJson, null, 2) + '\n',
    'utf-8',
  );
  await fs.promises.writeFile(
    path.join(base, 'AGENTS.md'),
    rapidCmi5AgentInstructions,
    'utf-8',
  );
  await fs.promises.writeFile(
    path.join(base, 'CLAUDE.md'),
    rapidCmi5AgentInstructions,
    'utf-8',
  );

  const codexDir = path.join(base, '.codex');
  const codexConfigPath = path.join(codexDir, 'config.toml');
  await fs.promises.mkdir(codexDir, { recursive: true });

  let existingCodexConfig = '';
  try {
    existingCodexConfig = await fs.promises.readFile(codexConfigPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.promises.writeFile(
    codexConfigPath,
    upsertCodexMcpConfig(existingCodexConfig, url),
    'utf-8',
  );
}

let mcpServerReady: Promise<void> | null = null;

function ensureMcpServer(): Promise<void> {
  if (!mcpServerReady) {
    mcpServerReady = startMcpServer().catch((error) => {
      mcpServerReady = null;
      throw error;
    });
  }
  return mcpServerReady;
}

app.whenReady().then(() => {
  ensureMcpServer().catch((e) =>
    console.error('Failed to start MCP server:', e),
  );
});

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
      return await getFsHandler().cloneRepo(
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
      return await getFsHandler().pullRepo(
        repoPath,
        branch,
        username,
        password,
      );
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
      return await getFsHandler().pushRepo(repoPath, username, password);
    } catch (error) {
      console.error('Error pushing repository:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:chooseProject', async (_e) => {
  try {
    return await getFsHandler().chooseProject();
  } catch (error) {
    console.error('Error choosing project:', error);
    throw error;
  }
});

ipcMain.handle('fs:getRecentProjects', () => {
  try {
    return getFsHandler().getRecentProjects();
  } catch (error) {
    console.error('Error getting recent projects:', error);
    throw error;
  }
});

ipcMain.handle('fs:removeRecentProject', (_e, id: string) => {
  try {
    return removeRecentProject(id);
  } catch (error) {
    console.error('Error removing recent project:', error);
    throw error;
  }
});

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
      return await getFsHandler().gitCommit(repoPath, message, name, email);
    } catch (error) {
      console.error('Error committing changes:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:addRecentProject', (_e, id: string) => {
  try {
    return addRecentProject(id);
  } catch (error) {
    console.error('Error adding recent project:', error);
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

ipcMain.handle(
  'fs:gitInitRepo',
  async (_e, repoPath: string, defaultBranch: string) => {
    try {
      return await getFsHandler().gitInitRepo(repoPath, defaultBranch);
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  },
);

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

ipcMain.handle(
  'fs:getGitConfig',
  async (_e, repoPath: string, configPath: string) => {
    try {
      return await getFsHandler().getGitConfig(repoPath, configPath);
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
      return await getFsHandler().setGitConfig(repoPath, configPath, value);
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
      return await getFsHandler().gitCheckout(repoPath, branch);
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
      return await getFsHandler().gitAddRemote(repoPath, remoteUrl);
    } catch (error) {
      console.error('Error adding remote:', error);
      throw error;
    }
  },
);

ipcMain.handle('fs:gitAdd', async (_e, repoPath: string, filePath: string) => {
  try {
    return await getFsHandler().gitAdd(repoPath, filePath);
  } catch (error) {
    console.error('Error adding file to git:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:gitRemove',
  async (_e, repoPath: string, filePath: string) => {
    try {
      return await getFsHandler().gitRemove(repoPath, filePath);
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
      return await getFsHandler().gitWriteRef(repoPath, branch, commitHash);
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
      return await getFsHandler().revertFileToHEAD(repoPath, filePath);
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
      return await getFsHandler().getFolderStructure(
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
    return await getFsHandler().gitLog(repoPath);
  } catch (error) {
    console.error('Error getting git log:', error);
    throw error;
  }
});

ipcMain.handle(
  'fs:gitResetIndex',
  async (_e, repoPath: string, relFilePath: string) => {
    try {
      return await getFsHandler().gitResetIndex(repoPath, relFilePath);
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
      return await getFsHandler().gitResolveFile(repoPath, relFilePath);
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
      return await getFsHandler().gitStash(repoPath, op);
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
      return await getFsHandler().gitResolveRef(repoPath, branch);
    } catch (error) {
      console.error('Error resolving ref:', error);
      throw error;
    }
  },
);

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

ipcMain.handle('fs:readPlayerConfig', async (_e) => {
  try {
    return await getFsHandler().readPlayerConfig();
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});
ipcMain.handle('fs:writePlayerConfig', async (_e, content) => {
  try {
    return await getFsHandler().writePlayerConfig(content);
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});

ipcMain.handle('userSettingsApi:getSSOConfig', () => {
  return store.get('ssoConfig');
});

ipcMain.handle('userSettingsApi:setSSOConfig', (_e, config: SSOConfig) => {
  store.set('ssoConfig', config);
  return true;
});

ipcMain.handle('userSettingsApi:loginSSO', async (_e, refresh = true) => {
  if (refresh) {
    const enc = store.get('refreshToken');
    const storedRefreshToken = enc ? decryptToken(enc) : null;
    const tokens = await loginWithRefreshOrRedirect(storedRefreshToken);
    store.set('refreshToken', encryptToken(tokens.refresh_token));
    return tokens;
  } else {
    const tokens = await loginSSORedirect();
    return tokens;
  }
});

ipcMain.handle('userSettingsApi:logoutSSO', async () => {
  const enc = store.get('refreshToken');
  const refreshToken = enc ? decryptToken(enc) : null;

  if (refreshToken) {
    try {
      await logoutSSO(refreshToken);
    } catch (err) {
      console.error('SSO logout failed:', err);
    }
  }

  // Clean up stored tokens regardless of whether the server logout succeeded
  store.delete('refreshToken');
  store.delete('ssoCredentials');
});

ipcMain.handle(
  'userSettingsApi:setGitCredentials',
  async (_e, creds: Credentials) => {
    const enc = encryptCredentials(creds);
    store.set('gitCredentials', enc);
  },
);

ipcMain.handle('userSettingsApi:getGitCredentials', (_e) => {
  const enc = store.get('gitCredentials');
  if (!enc) return null;
  return decryptCredentials(enc) ?? null;
});

ipcMain.handle(
  'userSettingsApi:setSSOCredentials',
  async (_e, creds: Credentials) => {
    const enc = encryptCredentials(creds);
    store.set('ssoCredentials', enc);
  },
);

ipcMain.handle(
  'userSettingsApi:setGitUserConfig',
  (_e, config: GitUserConfig) => {
    store.set('gitUserConfig', config);
    return true;
  },
);

ipcMain.handle('userSettingsApi:getGitUserConfig', () => {
  return store.get('gitUserConfig') ?? null;
});

ipcMain.handle('userSettingsApi:clearGitCredentials', () => {
  store.delete('gitCredentials');
  return true;
});

// Cert Manager
applyCustomCerts();

ipcMain.handle('userSettingsApi:listCerts', () => {
  return listCerts();
});

ipcMain.handle(
  'userSettingsApi:addCert',
  (_e, filename: string, contents: string) => {
    const cert = addCert(filename, contents);
    // Re-apply so the new cert is trusted immediately
    applyCustomCerts();
    return cert;
  },
);

ipcMain.handle('userSettingsApi:removeCert', (_e, id: string) => {
  removeCert(id);
  applyCustomCerts();
});

// Handle frontend API calls to not deal with CORS errors due to electron running on localhost
// This should likely be solved in keycloak, but to deal with servers where we do not control keycloak
// we must instead proxy through
// main.ts

ipcMain.handle(
  'api:request',
  async (_event, { url, method, headers, body }) => {
    console.log('proxy, url', url);
    const response = await net.fetch(url, { method, headers, body });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  },
);

// Test In Player Handler — writes config.json directly from in-memory AU data,
// then opens the player dev server in the default browser. No zip build needed.
ipcMain.handle(
  'cmi5:testInPlayer',
  async (_evt, auJson: string, playerUrl: string, configDestPath: string) => {
    try {
      await fs.promises.mkdir(nodePath.dirname(configDestPath), {
        recursive: true,
      });
      await fs.promises.writeFile(configDestPath, auJson, 'utf-8');
      shell.openExternal(playerUrl);
      return { success: true };
    } catch (err: any) {
      console.error('cmi5:testInPlayer failed', err);
      return { success: false, error: err?.message ?? String(err) };
    }
  },
);

// CMI5 Build Handler
ipcMain.handle(
  'cmi5Build',
  async (
    _evt,
    projectPath: string,
    courseFolder: string,
    projectName: string,
  ) => {
    const coursePath = nodePath.join(projectPath, courseFolder);
    const folderStruct = await getFsHandler().getFolderStructure(
      coursePath,
      coursePath,
      true,
      true,
    );
    const coursePathAbsolute = resolveSafe(coursePath, false);

    const tempPath = await builder.buildZip(
      coursePathAbsolute,
      folderStruct,
      projectName,
      courseFolder,
    );
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
      await pipeline(
        fs.createReadStream(tempPath),
        fs.createWriteStream(filePath),
      );
      shell.showItemInFolder(filePath);

      return { success: true, canceled: false, filePath };
    } finally {
      await fs.promises.rm(tempPath, { force: true }).catch((err) => {
        console.warn('Failed to remove temp build file:', err);
      });
    }
  },
);

// Claude CLI Handlers
ipcMain.handle('claude:start', (e, opts: StartOptions = {}) => {
  return startClaudeSession(e.sender, {
    ...opts,
    cwd: opts.cwd ?? getLocalFsBase(),
  });
});

ipcMain.handle('claude:input', (_e, sessionId: string, data: string) => {
  inputToSession(sessionId, data);
});

ipcMain.handle(
  'claude:resize',
  (_e, sessionId: string, cols: number, rows: number) => {
    resizeSession(sessionId, cols, rows);
  },
);

ipcMain.handle('claude:stop', (_e, sessionId: string) => {
  stopSession(sessionId);
});

// Codex CLI Handlers
ipcMain.handle('codex:start', async (e, opts: StartOptions = {}) => {
  await ensureMcpServer();
  return startCodexSession(e.sender, {
    ...opts,
    cwd: opts.cwd ?? getLocalFsBase(),
  });
});

ipcMain.handle('codex:input', (_e, sessionId: string, data: string) => {
  inputToSession(sessionId, data);
});

ipcMain.handle(
  'codex:resize',
  (_e, sessionId: string, cols: number, rows: number) => {
    resizeSession(sessionId, cols, rows);
  },
);

ipcMain.handle('codex:stop', (_e, sessionId: string) => {
  stopSession(sessionId);
});

// Terminal Handlers (direct OS shell)
ipcMain.handle('terminal:start', (e, opts: StartOptions = {}) => {
  return startPtySession(e.sender, 'terminal', {
    ...opts,
    command: opts.command ?? defaultShell(),
    cwd: opts.cwd ?? getLocalFsBase(),
  });
});

ipcMain.handle('terminal:input', (_e, sessionId: string, data: string) => {
  inputToSession(sessionId, data);
});

ipcMain.handle(
  'terminal:resize',
  (_e, sessionId: string, cols: number, rows: number) => {
    resizeSession(sessionId, cols, rows);
  },
);

ipcMain.handle('terminal:stop', (_e, sessionId: string) => {
  stopSession(sessionId);
});

app.on('web-contents-created', (_e, wc) => {
  wc.on('destroyed', () => stopAllSessionsForWebContents(wc));
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
      UpdateEvents.initAutoUpdateService();
    }
  }
}

Main.initialize();
Main.bootstrapApp();
Main.bootstrapAppEvents();
