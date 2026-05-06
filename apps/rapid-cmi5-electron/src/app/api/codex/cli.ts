import { type WebContents } from 'electron';

import {
  inputToSession,
  resizeSession,
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
  return startPtySession(webContents, 'codex', {
    ...opts,
    command: opts.command ?? 'codex',
  });
}

export {
  inputToSession,
  resizeSession,
  stopAllSessionsForWebContents,
  stopSession,
};
