import { randomUUID } from 'crypto';
import { app, type WebContents } from 'electron';
import * as pty from 'node-pty';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import fs from 'fs';

interface Session {
  id: string;
  proc: pty.IPty;
  webContents: WebContents;
}

const sessions = new Map<string, Session>();

export interface StartOptions {
  cwd?: string;
  args?: string[];
  command?: string;
  cols?: number;
  rows?: number;
}

export type ClaudeStartOptions = StartOptions;

function uniquePathEntries(entries: Array<string | undefined>): string {
  const seen = new Set<string>();
  return entries
    .filter((entry): entry is string => !!entry)
    .flatMap((entry) => entry.split(path.delimiter))
    .filter((entry) => {
      if (!entry || seen.has(entry)) return false;
      seen.add(entry);
      return true;
    })
    .join(path.delimiter);
}

function existingChildBinDirs(parentDir: string): string[] {
  try {
    return fs
      .readdirSync(parentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(parentDir, entry.name, 'bin'))
      .filter((binDir) => fs.existsSync(binDir));
  } catch {
    return [];
  }
}

function buildPtyEnv(): NodeJS.ProcessEnv {
  const home = os.homedir();
  const existingPath = process.env.PATH;
  const nvmNodeBins = existingChildBinDirs(
    path.join(home, '.nvm', 'versions', 'node'),
  );
  const packagedAppPathAdditions =
    process.platform === 'win32'
      ? []
      : [
          ...nvmNodeBins,
          '/opt/homebrew/bin',
          '/usr/local/bin',
          '/usr/bin',
          '/bin',
          '/usr/sbin',
          '/sbin',
          path.join(home, '.volta/bin'),
          path.join(home, '.asdf/shims'),
          path.join(home, '.local/bin'),
          path.join(home, '.npm-global/bin'),
          path.join(home, '.yarn/bin'),
          path.join(home, '.pnpm'),
          path.join(home, '.bun/bin'),
          path.join(home, '.cargo/bin'),
        ];

  return {
    ...process.env,
    PATH: uniquePathEntries([existingPath, ...packagedAppPathAdditions]),
    FORCE_COLOR: '1',
    TERM: 'xterm-256color',
  };
}

function defaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC ?? 'cmd.exe';
  }
  return process.env.SHELL ?? '/bin/zsh';
}

function quoteForPosixShell(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function shellLaunchOptions(
  binaryName: string,
  opts: StartOptions,
): StartOptions {
  if (opts.command) return opts;

  if (process.platform === 'win32') {
    const command = binaryName.endsWith('.cmd')
      ? binaryName
      : `${binaryName}.cmd`;
    return {
      ...opts,
      command,
    };
  }

  const args = opts.args ?? [];
  const commandLine = ['exec', quoteForPosixShell(binaryName)]
    .concat(args.map(quoteForPosixShell))
    .join(' ');

  return {
    ...opts,
    command: defaultShell(),
    args: ['-lc', commandLine],
  };
}

export function startClaudeSession(
  webContents: WebContents,
  opts: ClaudeStartOptions = {},
): { sessionId: string } {
  return startCommandSession(webContents, 'claude', 'claude', opts);
}

export function startCommandSession(
  webContents: WebContents,
  channelPrefix: string,
  binaryName: string,
  opts: StartOptions = {},
): { sessionId: string } {
  const shellOpts = shellLaunchOptions(binaryName, opts);

  return startPtySession(webContents, channelPrefix, shellOpts);
}

export function startPtySession(
  webContents: WebContents,
  channelPrefix: string,
  opts: StartOptions = {},
): { sessionId: string } {
  const id = randomUUID();
  const command = opts.command;
  if (!command) {
    throw new Error('startPtySession: opts.command is required');
  }
  const args = opts.args ?? [];
  const cwd = opts.cwd ?? process.cwd();
  const cols = opts.cols ?? 80;
  const rows = opts.rows ?? 30;
  const env = buildPtyEnv();

  const send = (suffix: string, payload: unknown) => {
    if (!webContents.isDestroyed())
      webContents.send(`${channelPrefix}:${suffix}`, payload);
  };

  let proc: pty.IPty;
  try {
    proc = pty.spawn(command, args, {
      name: 'xterm-256color',
      cols,
      rows,
      cwd,
      env,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    setImmediate(() => {
      send('error', { sessionId: id, message });
      send('exit', { sessionId: id, code: null, signal: null });
    });
    return { sessionId: id };
  }

  proc.onData((data) => {
    send('data', { sessionId: id, data, stream: 'stdout' });
  });
  proc.onExit(({ exitCode, signal }) => {
    sessions.delete(id);

    send('exit', {
      sessionId: id,
      code: exitCode,
      signal: signal == null ? null : String(signal),
    });
  });

  sessions.set(id, { id, proc, webContents });
  return { sessionId: id };
}

export function inputToSession(sessionId: string, data: string): void {
  const s = sessions.get(sessionId);
  if (!s) {
    return;
  }
  try {
    s.proc.write(data);
  } catch (err) {}
}

export function resizeSession(
  sessionId: string,
  cols: number,
  rows: number,
): void {
  const s = sessions.get(sessionId);
  if (!s) {
    return;
  }
  try {
    s.proc.resize(Math.max(1, cols | 0), Math.max(1, rows | 0));
  } catch (err) {}
}

export function stopSession(sessionId: string): void {
  const s = sessions.get(sessionId);
  if (!s) {
    return;
  }
  try {
    s.proc.kill();
  } catch (err) {}
  sessions.delete(sessionId);
}

export function stopAllSessionsForWebContents(wc: WebContents): void {
  for (const [id, s] of sessions) {
    if (s.webContents === wc) {
      try {
        s.proc.kill();
      } catch (err) {}
      sessions.delete(id);
    }
  }
}
