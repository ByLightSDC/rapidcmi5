#!/usr/bin/env node
// Bundles the typed MCP server (TS) into a self-contained JS asset that the
// Electron app copies into <localFsBase>/.rapid-mcp/server.js at runtime.
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const entry = path.join(
  repoRoot,
  'apps/rapid-cmi5-electron/src/app/api/mcp/server.ts',
);
const outfile = path.join(
  repoRoot,
  'apps/rapid-cmi5-electron/src/assets/mcp/server.js',
);

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'info',
});
