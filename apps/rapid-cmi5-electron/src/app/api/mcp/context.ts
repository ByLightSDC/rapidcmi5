import { BrowserWindow } from 'electron';

export interface McpContext {
  rootDir: string;
  getMainWindow: () => BrowserWindow | null;
}
