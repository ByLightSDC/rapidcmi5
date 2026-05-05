// RapidCMI5 MCP server. Runs in-process inside the Electron main process and
// is exposed over HTTP (see ./httpServer.ts). Tools receive an McpContext that
// gives them access to the localFileSystem root and the renderer window.
import { promises as fsp } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { z } from 'zod/v4';
import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';
import type { CourseData as Rc5CourseData } from '@rapid-cmi5/cmi5-build-common';
import {
  createNewCourseFS,
  type CourseCreationFs,
  type CourseRepoAccessObject,
} from '../../../../../../packages/rapid-cmi5/src/lib/design-tools/course-builder/GitViewer/utils/coureOperations';
const SlideSchema = z.object({
  slideTitle: z.string(),
  type: z
    .enum([
      'markdown',
      'quiz',
      'ctf',
      'rangeosScenario',
      'sourceDoc',
      'codeRunner',
    ])
    .describe(
      'Slide type. Default to "markdown" unless the user asks for something else.',
    ),
  filepath: z
    .string()
    .describe(
      'Slide path relative to the course root, e.g. "introduction/slide-1.md".',
    ),
  content: z.string().optional().describe('Markdown body of the slide.'),
});

const CourseAuSchema = z.object({
  auName: z.string().describe('Human-readable AU/lesson name.'),
  dirPath: z
    .string()
    .describe(
      'AU folder name relative to the course root, lowercase with dashes, e.g. "introduction".',
    ),
  slides: z.array(SlideSchema),
});

const CourseBlockSchema = z.object({
  blockName: z.string(),
  blockDescription: z.string().optional(),
  aus: z.array(CourseAuSchema),
});

const CourseDataSchema = z.object({
  courseTitle: z.string().describe('Human-readable course title.'),
  courseId: z
    .string()
    .describe(
      'Unique course id, typically a URL like "https://example.com/my-course".',
    ),
  courseDescription: z.string().optional(),
  author: z.string().optional(),
  blocks: z
    .array(CourseBlockSchema)
    .describe('Top-level course blocks. Most courses have a single block.'),
});

type CourseDataInput = z.infer<typeof CourseDataSchema>;

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

function text(s: string, isError = false): ToolResult {
  return { content: [{ type: 'text', text: s }], isError };
}

function createElectronCourseFs(rootDir: string): CourseCreationFs {
  const localFsPrefix = '/localFileSystem';
  const toRealPath = (virtualPath: string) => {
    const normalized = path.posix.normalize(virtualPath.replace(/\\/g, '/'));
    const relative = normalized.startsWith(`${localFsPrefix}/`)
      ? normalized.slice(localFsPrefix.length + 1)
      : normalized === localFsPrefix
        ? ''
        : normalized.replace(/^\/+/, '');
    const resolved = path.resolve(rootDir, relative);
    const relToRoot = path.relative(rootDir, resolved);

    if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) {
      throw new Error(
        `Path escapes the RapidCMI5 local filesystem: ${virtualPath}`,
      );
    }

    return resolved;
  };

  const repoPath = (r: CourseRepoAccessObject) =>
    path.posix.join('/', r.fileSystemType, r.repoName);
  const absoluteCoursePath = (
    r: CourseRepoAccessObject,
    relativePath: string,
  ) => toRealPath(path.posix.join(repoPath(r), relativePath));

  return {
    fs: {
      promises: {
        stat: async (virtualPath: string) => fsp.stat(toRealPath(virtualPath)),
      },
    },
    createDir: async (r, dirPath) => {
      await fsp.mkdir(absoluteCoursePath(r, dirPath), { recursive: true });
    },
    createFile: async (r, filePath, content) => {
      const realPath = absoluteCoursePath(r, filePath);
      await fsp.mkdir(path.dirname(realPath), { recursive: true });
      await fsp.writeFile(realPath, content);
    },
    updateFile: async (r, filePath, newContent) => {
      const realPath = absoluteCoursePath(r, filePath);
      await fsp.mkdir(path.dirname(realPath), { recursive: true });
      await fsp.writeFile(realPath, newContent);
    },
  };
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
    name: 'list_courses',
    description:
      'List the top-level directories in the RapidCMI5 local file system. Each is a course.',
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
      return text(dirs.length ? dirs.join('\n') : '(no courses found)');
    },
  },
  {
    name: 'create_course',
    description:
      'Scaffold a new RapidCMI5 course from a user prompt. Fill in courseTitle, a unique courseId (URL-style), and a structure of blocks → AUs → slides matching what the user asked for. Slide filepath is "<auDirPath>/<slide-slug>.md". Default slide type is "markdown"; "content" is the markdown body.',
    inputSchema: z.toJSONSchema(CourseDataSchema) as Record<string, unknown>,
    handler: async (args, ctx) => {
      const courseData = CourseDataSchema.parse(
        args,
      ) as CourseDataInput as Rc5CourseData;
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

      const repoName =
        typeof args.repoName === 'string' && args.repoName.trim()
          ? args.repoName.trim()
          : 'tester';
      const fsInstance = createElectronCourseFs(ctx.rootDir);

      await createNewCourseFS({
        course: courseData,
        r: { repoName, fileSystemType: 'localFileSystem' },
        fsInstance,
      });

      win.webContents.send('course:refreshFrontend');

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
