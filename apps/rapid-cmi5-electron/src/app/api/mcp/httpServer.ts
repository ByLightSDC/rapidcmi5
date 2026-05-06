// HTTP host for the in-process MCP server. Implements the MCP Streamable HTTP
// transport's POST half: clients POST a JSON-RPC request to /mcp and receive
// the response as application/json. Notifications get HTTP 202.

import http from 'http';
import { handleJsonRpc, type McpContext, type JsonRpcRequest } from './server';

export interface McpHttpServer {
  port: number;
  url: string;
  close: () => void;
}

export function startMcpHttpServer(ctx: McpContext): Promise<McpHttpServer> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.method !== 'POST' || req.url !== '/mcp') {
        res.writeHead(404);
        res.end();
        return;
      }

      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk: string) => {
        body += chunk;
      });
      req.on('end', async () => {
        let parsed: JsonRpcRequest;
        try {
          parsed = JSON.parse(body) as JsonRpcRequest;
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: { code: -32700, message: 'Parse error' },
            }),
          );
          return;
        }

        try {
          const response = await handleJsonRpc(parsed, ctx);
          if (response === null) {
            res.writeHead(202);
            res.end();
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } catch (err) {
          console.error('MCP request failed:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: parsed?.id ?? null,
              error: {
                code: -32000,
                message: err instanceof Error ? err.message : String(err),
              },
            }),
          );
        }
      });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (typeof addr !== 'object' || addr === null) {
        reject(new Error('Failed to determine MCP server address'));
        return;
      }
      const port = addr.port;
      resolve({
        port,
        url: `http://127.0.0.1:${port}/mcp`,
        close: () => server.close(),
      });
    });
  });
}
