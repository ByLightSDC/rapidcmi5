import http, { type IncomingMessage, type ServerResponse } from 'http';
import type { AddressInfo } from 'net';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';

const MCP_ENDPOINT = '/mcp';
const HOST = '127.0.0.1';

// JSON-RPC error codes — see https://www.jsonrpc.org/specification#error_object
const JSON_RPC_PARSE_ERROR = -32700;
const JSON_RPC_APPLICATION_ERROR = -32000;

export interface McpEndpoint {
  port: number;
  url: string;
  close: () => Promise<void>;
}

interface Session {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

export async function startTransport(
  createServer: () => McpServer,
): Promise<McpEndpoint> {
  const sessions = new Map<string, Session>();

  const httpServer = http.createServer((req, res) => {
    handleRequest(req, res, createServer, sessions).catch((err) => {
      console.error('Unhandled MCP request error:', err);
      if (!res.headersSent) {
        sendJsonRpcError(
          res,
          500,
          JSON_RPC_APPLICATION_ERROR,
          errorMessage(err),
        );
      }
    });
  });

  const port = await listen(httpServer, 0, HOST);
  return {
    port,
    url: `http://${HOST}:${port}${MCP_ENDPOINT}`,
    close: () => closeAll(httpServer, sessions),
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  createServer: () => McpServer,
  sessions: Map<string, Session>,
): Promise<void> {
  if (req.url !== MCP_ENDPOINT) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'not_found',
        message: 'No such endpoint. The MCP server endpoint is /mcp.',
      }),
    );
    return;
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    sendJsonRpcError(
      res,
      403,
      JSON_RPC_APPLICATION_ERROR,
      'Forbidden: invalid Origin',
    );
    return;
  }

  let parsedBody: unknown;
  if (req.method === 'POST') {
    const parsed = await readJsonBody(req, res);
    if (!parsed.ok) return;
    parsedBody = parsed.body;
  }

  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    await sessions
      .get(sessionId)
      ?.transport.handleRequest(req, res, parsedBody);
    return;
  }

  if (!sessionId) {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        sessions.set(sid, { transport, server });
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
      server.close().catch(() => {
        /* server already closing — ignore */
      });
    };
    await server.connect(transport);
    await transport.handleRequest(req, res, parsedBody);
    return;
  }

  sendJsonRpcError(res, 404, JSON_RPC_APPLICATION_ERROR, 'Unknown session');
}

async function readJsonBody(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  let raw = '';
  req.setEncoding('utf8');
  for await (const chunk of req) raw += chunk as string;
  if (raw.length === 0) {
    return { ok: true, body: undefined };
  }

  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    sendJsonRpcError(res, 400, JSON_RPC_PARSE_ERROR, 'Parse error');
    return { ok: false };
  }
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function sendJsonRpcError(
  res: ServerResponse,
  httpStatus: number,
  jsonRpcCode: number,
  message: string,
): void {
  res.writeHead(httpStatus, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: jsonRpcCode, message },
    }),
  );
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function listen(
  server: http.Server,
  port: number,
  host: string,
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const addr = server.address() as AddressInfo | null;
      if (!addr) {
        reject(new Error('Failed to determine MCP server address.'));
        return;
      }
      resolve(addr.port);
    });
  });
}

async function closeAll(
  httpServer: http.Server,
  sessions: Map<string, Session>,
): Promise<void> {
  await Promise.all([
    new Promise<void>((r) => httpServer.close(() => r())),
    ...Array.from(sessions.values()).flatMap((s) => [
      s.transport.close(),
      s.server.close().catch(() => undefined),
    ]),
  ]);
}
