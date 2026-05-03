// RapidCMI5 MCP server — runs as a child process spawned by Claude Code.
// Bundled to src/assets/mcp/server.js via scripts/build-mcp-server.mjs.
// Spawned with cwd = the RapidCMI5 localFileSystem root.
import { promises as fsp } from 'fs';
import { z } from 'zod/v4';

const SlideSchema = z.object({
  slideTitle: z.string(),
  type: z
    .enum(['markdown', 'quiz', 'ctf', 'rangeosScenario', 'sourceDoc', 'codeRunner'])
    .describe('Slide type. Default to "markdown" unless the user asks for something else.'),
  filepath: z
    .string()
    .describe('Slide path relative to the course root, e.g. "introduction/slide-1.md".'),
  content: z.string().optional().describe('Markdown body of the slide.'),
});

const CourseAuSchema = z.object({
  auName: z.string().describe('Human-readable AU/lesson name.'),
  dirPath: z
    .string()
    .describe('AU folder name relative to the course root, lowercase with dashes, e.g. "introduction".'),
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
    .describe('Unique course id, typically a URL like "https://example.com/my-course".'),
  courseDescription: z.string().optional(),
  author: z.string().optional(),
  blocks: z
    .array(CourseBlockSchema)
    .describe('Top-level course blocks. Most courses have a single block.'),
});

type CourseData = z.infer<typeof CourseDataSchema>;

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'rapid-cmi5';
const SERVER_VERSION = '0.1.0';

const ROOT = process.cwd();

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
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

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
}

const tools: McpTool[] = [
  {
    name: 'app_info',
    description:
      'Return basic info about this RapidCMI5 environment (cwd, platform, node version).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: () =>
      text(
        JSON.stringify(
          {
            app: 'RapidCMI5',
            cwd: ROOT,
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
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: async () => {
      const entries = await fsp.readdir(ROOT, { withFileTypes: true });
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
    handler: async (args) => {
      const courseData: CourseData = CourseDataSchema.parse(args);
      return text(JSON.stringify(courseData, null, 2));
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
    handler: (args) => text(typeof args.message === 'string' ? args.message : ''),
  },
];

const toolMap = new Map(tools.map((t) => [t.name, t]));

function text(s: string, isError = false): ToolResult {
  return { content: [{ type: 'text', text: s }], isError };
}

function send(msg: JsonRpcResponse | JsonRpcRequest): void {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function ok(id: number | string, result: unknown): void {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id: number | string, code: number, message: string): void {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function handle(msg: JsonRpcRequest): Promise<void> {
  const { id, method, params } = msg;
  try {
    switch (method) {
      case 'initialize':
        if (id !== undefined) {
          ok(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          });
        }
        return;
      case 'notifications/initialized':
        return;
      case 'tools/list':
        if (id !== undefined) {
          ok(id, {
            tools: tools.map(({ name, description, inputSchema }) => ({
              name,
              description,
              inputSchema,
            })),
          });
        }
        return;
      case 'tools/call': {
        if (id === undefined) return;
        const name = params?.['name'];
        const args = (params?.['arguments'] as Record<string, unknown>) ?? {};
        if (typeof name !== 'string') {
          fail(id, -32602, 'tools/call: missing name');
          return;
        }
        const tool = toolMap.get(name);
        if (!tool) {
          ok(id, text(`Unknown tool: ${name}`, true));
          return;
        }
        const result = await tool.handler(args);
        ok(id, result);
        return;
      }
      case 'ping':
        if (id !== undefined) ok(id, {});
        return;
      case 'shutdown':
        if (id !== undefined) ok(id, null);
        return;
      case 'exit':
        process.exit(0);
        return;
      default:
        if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (id !== undefined) {
      fail(id, -32000, e instanceof Error ? e.message : String(e));
    }
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => {
  buf += chunk;
  let nl: number;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let parsed: JsonRpcRequest;
    try {
      parsed = JSON.parse(line) as JsonRpcRequest;
    } catch {
      continue;
    }
    void handle(parsed);
  }
});
process.stdin.on('end', () => process.exit(0));
