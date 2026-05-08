import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpContext } from '../context';
import { SERVER_VERSION } from '../main';

export function registerPing(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_ping',
    {
      title: 'Ping',
      description:
        'Smoke-test the RapidCMI5 MCP server. Returns environment info so the caller can verify the connection is healthy.',
      inputSchema: {},
      outputSchema: {
        ok: z.boolean(),
        cwd: z.string(),
        node: z.string(),
        platform: z.string(),
        pid: z.number(),
        serverVersion: z.string(),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async () => {
      const result = {
        ok: true,
        cwd: ctx.rootDir,
        node: process.version,
        platform: process.platform,
        pid: process.pid,
        serverVersion: SERVER_VERSION,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );
}
