// RapidCMI5 MCP server. Runs in-process inside the Electron main process and
// is exposed over HTTP (see ./httpServer.ts). Tools receive an McpContext that
// gives them access to the localFileSystem root and the renderer window.
import { promises as fsp } from 'fs';
import { randomUUID } from 'crypto';
import { z } from 'zod/v4';
import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';
import {
  CourseData,
  CreateCourseInputSchema,
  QuizContent,
  QuizContentSchema,
} from '@rapid-cmi5/cmi5-build-common';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'rapid-cmi5';
const SERVER_VERSION = '0.1.0';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

interface ToolContent {
  type: 'text';
  text: string;
}

interface ToolResult {
  content: ToolContent[];
  isError?: boolean;
}

export interface McpContext {
  rootDir: string;
  getMainWindow: () => BrowserWindow | null;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (
    args: Record<string, unknown>,
    ctx: McpContext,
  ) => Promise<ToolResult> | ToolResult;
}

interface SaveCourseReply {
  requestId: string;
  ok: boolean;
  changedFiles?: string[];
  error?: string;
}

interface CreateCourseReply {
  requestId: string;
  ok: boolean;
  error?: string;
}

interface SlideReadReply {
  requestId: string;
  ok: boolean;
  markdown?: string;
  error?: string;
}

interface SlideUpdateReply {
  requestId: string;
  ok: boolean;
  error?: string;
}

interface CreateQuizReply {
  requestId: string;
  ok: boolean;
  error?: string;
}

function text(s: string, isError = false): ToolResult {
  return { content: [{ type: 'text', text: s }], isError };
}

function requestSaveCourse(win: BrowserWindow, timeoutMs = 120_000) {
  const requestId = randomUUID();
  const replyChannel = 'course:saveCourse:done';

  return new Promise<SaveCourseReply>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(new Error('Timed out waiting for the editor to save the course.'));
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: SaveCourseReply) => {
      if (reply?.requestId !== requestId) return;
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };

    ipcMain.on(replyChannel, onReply);
    win.webContents.send('course:saveCourse', { requestId });
  });
}

function requestCreateCourse(
  win: BrowserWindow,
  course: CourseData,
  repoName: string,
  timeoutMs = 120_000,
) {
  const requestId = randomUUID();
  const replyChannel = 'course:createCourse:done';

  return new Promise<CreateCourseReply>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(
        new Error('Timed out waiting for the editor to create the course.'),
      );
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: CreateCourseReply) => {
      if (reply?.requestId !== requestId) return;
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };

    ipcMain.on(replyChannel, onReply);
    win.webContents.send('course:createCourse', {
      requestId,
      course,
      repoName,
    });
  });
}

function requestReadCurrentSlide(win: BrowserWindow, timeoutMs = 30_000) {
  const requestId = randomUUID();
  const replyChannel = 'slide:readCurrent:done';

  return new Promise<SlideReadReply>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(new Error('Timed out waiting for the editor to read the slide.'));
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: SlideReadReply) => {
      if (reply?.requestId !== requestId) return;
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };

    ipcMain.on(replyChannel, onReply);
    win.webContents.send('slide:readCurrent', { requestId });
  });
}

function requestUpdateCurrentSlide(
  win: BrowserWindow,
  markdown: string,
  timeoutMs = 30_000,
) {
  const requestId = randomUUID();
  const replyChannel = 'slide:updateCurrent:done';

  return new Promise<SlideUpdateReply>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(
        new Error('Timed out waiting for the editor to update the slide.'),
      );
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: SlideUpdateReply) => {
      if (reply?.requestId !== requestId) return;
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };

    ipcMain.on(replyChannel, onReply);
    win.webContents.send('slide:updateCurrent', { requestId, markdown });
  });
}

function requestCreateQuiz(
  win: BrowserWindow,
  quiz: QuizContent,
  timeoutMs = 30_000,
) {
  const requestId = randomUUID();
  const replyChannel = 'quiz:create:done';

  return new Promise<CreateQuizReply>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(new Error('Timed out waiting for the editor to create the quiz.'));
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: CreateQuizReply) => {
      if (reply?.requestId !== requestId) return;
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };

    ipcMain.on(replyChannel, onReply);
    win.webContents.send('quiz:create', { requestId, quiz });
  });
}

const tools: McpTool[] = [
  {
    name: 'app_info',
    description:
      'Return basic info about this RapidCMI5 environment (cwd, platform, node version).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    handler: (_args, ctx) =>
      text(
        JSON.stringify(
          {
            app: 'RapidCMI5',
            cwd: ctx.rootDir,
            node: process.version,
            platform: process.platform,
            pid: process.pid,
          },
          null,
          2,
        ),
      ),
  },
  {
    name: 'list_projects',
    description:
      'List the available projects (top-level repo directories) in the RapidCMI5 local file system. Use one of these names as the repoName when calling create_course.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    handler: async (_args, ctx) => {
      const entries = await fsp.readdir(ctx.rootDir, { withFileTypes: true });
      const dirs = entries
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .map((e) => e.name)
        .sort();
      return text(dirs.length ? dirs.join('\n') : '(no projects found)');
    },
  },
  {
    name: 'create_course',
    description:
      'Scaffold a new RapidCMI5 course from a user prompt. Fill in courseTitle, a unique courseId (URL-style), and a structure of blocks → AUs → slides matching what the user asked for. Slide filepath is "<auDirPath>/<slide-slug>.md". Default slide type is "markdown"; "content" is the markdown body. repoName is required and must be one of the names returned by list_projects — call list_projects first if you do not already know it.',
    inputSchema: z.toJSONSchema(CreateCourseInputSchema) as Record<
      string,
      unknown
    >,
    handler: async (args, ctx) => {
      const parsed = CreateCourseInputSchema.parse(args);
      const { repoName: repoNameInput, ...courseFields } = parsed;
      const courseData = courseFields;
      const repoName = repoNameInput.trim();

      const entries = await fsp.readdir(ctx.rootDir, { withFileTypes: true });
      const validRepos = entries
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .map((e) => e.name);
      if (!validRepos.includes(repoName)) {
        return text(
          `Unknown repoName "${repoName}". Call list_projects to see valid options${
            validRepos.length ? `: ${validRepos.join(', ')}` : ' (none found — create a project first)'
          }.`,
          true,
        );
      }

      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text('No main window available to save the course.', true);
      }

      const saveReply = await requestSaveCourse(win);
      if (!saveReply.ok) {
        return text(
          saveReply.error ?? 'The editor failed to save the course.',
          true,
        );
      }

      const createReply = await requestCreateCourse(win, courseData, repoName);
      if (!createReply.ok) {
        return text(
          createReply.error ?? 'The editor failed to create the course.',
          true,
        );
      }
      return text(`Created course "${courseData.courseTitle}" in ${repoName}.`);
    },
  },
  {
    name: 'save_course',
    description:
      'Persist the currently open course to disk by asking the renderer to run its save flow.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    handler: async (_args, ctx) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text('No main window available to save the course.', true);
      }
      const reply = await requestSaveCourse(win);
      if (!reply.ok) {
        return text(
          reply.error ?? 'The editor failed to save the course.',
          true,
        );
      }
      const count = reply.changedFiles?.length ?? 0;
      return text(`Saved course in the editor. Changed files: ${count}.`);
    },
  },
  {
    name: 'update_display',
    description: 'Load file system course contents the frontend view',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    handler: (_args, ctx) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text('No main window available to save the course.', true);
      }
      win.webContents.send('course:refreshFrontend');
      return text('Triggered refresh in the editor.');
    },
  },
  {
    name: 'read_current_slide',
    description:
      'Read the markdown for the currently selected slide in the editor.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    handler: async (_args, ctx) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text(
          'No main window available to read the current slide.',
          true,
        );
      }

      const reply = await requestReadCurrentSlide(win);
      if (!reply.ok) {
        return text(
          reply.error ?? 'The editor failed to read the current slide.',
          true,
        );
      }

      return text(reply.markdown ?? '');
    },
  },
  {
    name: 'update_current_slide',
    description:
      'Replace the markdown for the currently selected slide in the editor.',
    inputSchema: {
      type: 'object',
      properties: {
        markdown: {
          type: 'string',
          description: 'New markdown content for the current slide.',
        },
      },
      required: ['markdown'],
      additionalProperties: false,
    },
    handler: async (args, ctx) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text(
          'No main window available to update the current slide.',
          true,
        );
      }

      if (typeof args.markdown !== 'string') {
        return text('update_current_slide requires markdown.', true);
      }

      const reply = await requestUpdateCurrentSlide(win, args.markdown);
      if (!reply.ok) {
        return text(
          reply.error ?? 'The editor failed to update the current slide.',
          true,
        );
      }

      return text('Updated current slide markdown.');
    },
  },
  {
    name: 'create_quiz',
    description:
      'Append a quiz activity to the end of the currently selected markdown slide.',
    inputSchema: z.toJSONSchema(QuizContentSchema) as Record<string, unknown>,
    handler: async (args, ctx) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return text('No main window available to create the quiz.', true);
      }

      const reply = await requestCreateQuiz(win, args as QuizContent);
      if (!reply.ok) {
        return text(
          reply.error ?? 'The editor failed to create the quiz.',
          true,
        );
      }

      return text('Created quiz on current slide.');
    },
  },
  {
    name: 'echo',
    description:
      'Echo a string back. Useful for sanity-checking the MCP wiring.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Text to echo back.' },
      },
      required: ['message'],
      additionalProperties: false,
    },
    handler: (args) =>
      text(typeof args.message === 'string' ? args.message : ''),
  },
];

const toolMap = new Map(tools.map((t) => [t.name, t]));

function ok(id: number | string, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result };
}

function fail(
  id: number | string,
  code: number,
  message: string,
): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

// Returns null for notifications (no id) — caller should reply with HTTP 202.
export async function handleJsonRpc(
  msg: JsonRpcRequest,
  ctx: McpContext,
): Promise<JsonRpcResponse | null> {
  const { id, method, params } = msg;
  const isNotification = id === undefined;

  try {
    switch (method) {
      case 'initialize':
        if (isNotification) return null;
        return ok(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        });
      case 'notifications/initialized':
        return null;
      case 'tools/list':
        if (isNotification) return null;
        return ok(id, {
          tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        });
      case 'tools/call': {
        if (isNotification) return null;
        const name = params?.['name'];
        const args = (params?.['arguments'] as Record<string, unknown>) ?? {};
        if (typeof name !== 'string') {
          return fail(id, -32602, 'tools/call: missing name');
        }
        const tool = toolMap.get(name);
        if (!tool) {
          return ok(id, text(`Unknown tool: ${name}`, true));
        }
        const result = await tool.handler(args, ctx);
        return ok(id, result);
      }
      case 'ping':
        if (isNotification) return null;
        return ok(id, {});
      case 'shutdown':
        if (isNotification) return null;
        return ok(id, null);
      default:
        if (isNotification) return null;
        return fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (isNotification) return null;
    return fail(id, -32000, e instanceof Error ? e.message : String(e));
  }
}
