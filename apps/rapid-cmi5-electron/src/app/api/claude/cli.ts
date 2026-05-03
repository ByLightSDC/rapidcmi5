import { randomUUID } from 'crypto';
import { type WebContents } from 'electron';
import * as pty from 'node-pty';

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
      env: { ...process.env, FORCE_COLOR: '1', TERM: 'xterm-256color' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setImmediate(() => {
      send('error', { sessionId: id, message });
      send('exit', { sessionId: id, code: null, signal: null });
    });
    return { sessionId: id };
  }

  proc.onData((data) =>
    send('data', { sessionId: id, data, stream: 'stdout' }),
  );
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
  if (!s) return;
  try {
    s.proc.write(data);
  } catch {
    // session closed mid-write
  }
}

export function resizeSession(
  sessionId: string,
  cols: number,
  rows: number,
): void {
  const s = sessions.get(sessionId);
  if (!s) return;
  try {
    s.proc.resize(Math.max(1, cols | 0), Math.max(1, rows | 0));
  } catch {
    // session closed
  }
}

export function stopSession(sessionId: string): void {
  const s = sessions.get(sessionId);
  if (!s) return;
  try {
    s.proc.kill();
  } catch {
    // already dead
  }
  sessions.delete(sessionId);
}

export function stopAllSessionsForWebContents(wc: WebContents): void {
  for (const [id, s] of sessions) {
    if (s.webContents === wc) {
      try {
        s.proc.kill();
      } catch {
        // already dead
      }
      sessions.delete(id);
    }
  }
}
