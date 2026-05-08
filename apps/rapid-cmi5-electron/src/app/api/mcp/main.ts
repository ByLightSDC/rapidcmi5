import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { startTransport, type McpEndpoint } from './transport';
import { registerAllTools } from './tools';
import type { McpContext } from './context';

export const SERVER_NAME = 'rapid-cmi5';
export const SERVER_VERSION = '0.1.0';

export async function startMcp(ctx: McpContext): Promise<McpEndpoint> {
  return startTransport(() => {
    const server = new McpServer(
      { name: SERVER_NAME, version: SERVER_VERSION },
      { capabilities: { tools: {} } },
    );
    registerAllTools(server, ctx);
    return server;
  });
}
