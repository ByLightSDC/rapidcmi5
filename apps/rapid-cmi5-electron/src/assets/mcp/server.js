#!/usr/bin/env node
// RapidCMI5 MCP server — zero-dependency stdio JSON-RPC.
// Spawned by Claude Code via .mcp.json sitting next to it. cwd is the
// RapidCMI5 localFileSystem root.
'use strict';

const fs = require('fs');
const path = require('path');

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_NAME = 'rapid-cmi5';
const SERVER_VERSION = '0.1.0';

const ROOT = process.cwd();

const TOOLS = [
  {
    name: 'app_info',
    description:
      'Return basic info about this RapidCMI5 environment (cwd, platform, node version).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_courses',
    description:
      'List the top-level directories in the RapidCMI5 local file system. Each is a course.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'echo',
    description: 'Echo a string back. Useful for sanity-checking the MCP wiring.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Text to echo back.' },
      },
      required: ['message'],
      additionalProperties: false,
    },
  },
];

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}
function ok(id, result) {
  send({ jsonrpc: '2.0', id, result });
}
function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}
function textResult(text, isError) {
  return {
    content: [{ type: 'text', text: String(text) }],
    isError: Boolean(isError),
  };
}

async function callTool(name, args) {
  if (name === 'app_info') {
    return textResult(
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
    );
  }
  if (name === 'list_courses') {
    const entries = await fs.promises.readdir(ROOT, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort();
    return textResult(dirs.length ? dirs.join('\n') : '(no courses found)');
  }
  if (name === 'echo') {
    const message = args && typeof args.message === 'string' ? args.message : '';
    return textResult(message);
  }
  return textResult(`Unknown tool: ${name}`, true);
}

async function handle(msg) {
  const { id, method, params } = msg;
  try {
    switch (method) {
      case 'initialize':
        return ok(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        });
      case 'notifications/initialized':
        return; // notification, no response
      case 'tools/list':
        return ok(id, { tools: TOOLS });
      case 'tools/call': {
        const name = params && params.name;
        const args = (params && params.arguments) || {};
        const result = await callTool(name, args);
        return ok(id, result);
      }
      case 'ping':
        return ok(id, {});
      case 'shutdown':
        return ok(id, null);
      case 'exit':
        process.exit(0);
        return;
      default:
        if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (id !== undefined) fail(id, -32000, (e && e.message) || String(e));
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    handle(msg);
  }
});
process.stdin.on('end', () => process.exit(0));
