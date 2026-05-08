import { type WebContents } from 'electron';

import {
  inputToSession,
  resizeSession,
  startCommandSession,
  startPtySession,
  stopAllSessionsForWebContents,
  stopSession,
  type StartOptions,
} from '../claude/cli';

export type CodexStartOptions = StartOptions;

export function startCodexSession(
  webContents: WebContents,
  opts: CodexStartOptions = {},
): { sessionId: string } {
  if (opts.command) {
    return startPtySession(webContents, 'codex', opts);
  }
  return startCommandSession(webContents, 'codex', 'codex', opts);
}

export {
  inputToSession,
  resizeSession,
  stopAllSessionsForWebContents,
  stopSession,
};
