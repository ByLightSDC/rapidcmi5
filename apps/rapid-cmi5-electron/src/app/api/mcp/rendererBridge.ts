import { randomUUID } from 'crypto';
import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';

const DEFAULT_TIMEOUT_MS = 30_000;

export interface RendererReply {
  requestId: string;
  ok: boolean;
  error?: string;
}

export interface RendererRequestOptions {
  sendChannel: string;
  replyChannel: string;
  payload?: Record<string, unknown>;
  timeoutMs?: number;
}

export function requestFromRenderer<T extends RendererReply>(
  win: BrowserWindow,
  options: RendererRequestOptions,
): Promise<T> {
  const {
    sendChannel,
    replyChannel,
    payload = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;
  const requestId = randomUUID();

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      ipcMain.removeListener(replyChannel, onReply);
      reject(new Error(`Timed out waiting for ${replyChannel}`));
    }, timeoutMs);

    const onReply = (_event: IpcMainEvent, reply: T) => {
      if (reply.requestId !== requestId) {
        return;
      }
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      resolve(reply);
    };
    ipcMain.on(replyChannel, onReply);

    try {
      win.webContents.send(sendChannel, { requestId, ...payload });
    } catch (err) {
      clearTimeout(timeout);
      ipcMain.removeListener(replyChannel, onReply);
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
