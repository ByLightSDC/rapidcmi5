import { BufferEncodingOption, RmOptions } from 'fs';

export interface FileStat {
  size: number;
  mtimeMs: number;
  isFile: boolean;
  isDirectory: boolean;
  path: string;
}

export interface DirEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}

export type RendererFileData = string | ArrayBuffer | Uint8Array | Blob;

// Minimal stat shape isomorphic-git needs: methods, not booleans.
type StatLike = {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
  mtimeMs: number;
  ctimeMs: number;
  size: number;
  mode: number;
};

// Build a PromiseFsClient using your preload-exposed APIs.
export const electronFs = {
  promises: {
    async readFile(
      path: string,
      options?: { encoding?: string },
    ): Promise<Uint8Array | string> {
      if (path === undefined) {
        console.trace('readFile called with undefined path');
        throw Object.assign(
          new Error(`ENOENT: no such file or directory, open '${path}'`),
          {
            code: 'ENOENT',
          },
        );
      }

      const data = await window.fsApi.readFile(path);

      if (options?.encoding) {
        const enc = options.encoding.toLowerCase();
        if (enc === 'utf8' || enc === 'utf-8') {
          // Node:
          if (typeof Buffer !== 'undefined' && (data as any).buffer) {
            return Buffer.from(data as Uint8Array).toString('utf8');
          }
          // Browser:
          return new TextDecoder('utf-8').decode(
            data instanceof Uint8Array
              ? data
              : new Uint8Array(data as ArrayBuffer),
          );
        }
        // Add other encodings if you need them
      }

      // No encoding: return bytes (Uint8Array)
      if (data instanceof Uint8Array) return data;
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
        return new Uint8Array(data);
      }
      // If backend returns ArrayBuffer
      return new Uint8Array(data);
    },
    async writeFile(path: string, data: string | Uint8Array): Promise<void> {
      await window.fsApi.writeFile(path, data);
    },
    async unlink(path: string): Promise<void> {
      await window.fsApi.rm(path);
    },
    async readdir(path: string): Promise<string[]> {
      if (path === undefined) {
        console.trace('readFile called with undefined path');
        throw Object.assign(
          new Error(`ENOENT: no such file or directory, open '${path}'`),
          {
            code: 'ENOENT',
          },
        );
      }
      try {
        const entries = await window.fsApi.readdir(path);
        return entries.map((e: { name: string }) => e.name);
      } catch (e: any) {
        if (e?.code === 'ENOENT' || e?.name === 'NotFoundError') {
          // rethrow as ENOENT

          const err = new Error(
            `ENOENT: no such file or directory, stat '${path}'`,
          );
          (err as any).code = 'ENOENT';
          throw err;
        }
        throw e;
      }
    },
    async mkdir(path: string, opts?: { recursive?: boolean }): Promise<void> {
      await window.fsApi.mkdir(path, !!opts?.recursive);
    },
    async rmdir(path: string): Promise<void> {
      // rmdir is deprecated in Node, but isomorphic-git still asks for it.
      await window.fsApi.rm(path, true);
    },
    async rm(path: string, options?: RmOptions) {
      await window.fsApi.rm(path, options?.recursive);
    },
    async exists(path: string): Promise<boolean> {
      return await window.fsApi.exists(path);
    },
    async stat(path: string): Promise<StatLike> {
      try {
        const s = await window.fsApi.stat(path);
        if (!s) {
          throw Object.assign(
            new Error(`ENOENT: no such file or directory, open '${path}'`),
            {
              code: 'ENOENT',
            },
          );
        }
        const now = Date.now();

        return {
          isFile: () => s.isFile,
          isSymbolicLink: () => s.isSymbolicLink,
          isDirectory: () => s.isDirectory,
          mtimeMs: Number.isFinite(s.mtimeMs) ? s.mtimeMs : now,
          ctimeMs: s.ctimeMs,
          mode: s.mode,
          size: s.size,
        };
      } catch (e: any) {
        if (e?.code === 'ENOENT' || e?.name === 'NotFoundError') {
          // rethrow as ENOENT

          const err = new Error(
            `ENOENT: no such file or directory, stat '${path}'`,
          );
          (err as any).code = 'ENOENT';
          throw err;
        }
        throw e;
      }
    },
    async lstat(path: string): Promise<StatLike> {
      try {
        const s = await window.fsApi.stat(path);
        if (!s) {
          throw Object.assign(
            new Error(`ENOENT: no such file or directory, open '${path}'`),
            {
              code: 'ENOENT',
            },
          );
        }
        const now = Date.now();

        return {
          isFile: () => s.isFile,
          isSymbolicLink: () => s.isSymbolicLink,
          isDirectory: () => s.isDirectory,
          mtimeMs: Number.isFinite(s.mtimeMs) ? s.mtimeMs : now,
          ctimeMs: s.ctimeMs,
          mode: s.mode,
          size: s.size,
        };
      } catch (e: any) {
        throw e;
      }
    },
    async rename(oldpath: string, newpath: string) {
      await window.fsApi.rename(oldpath, newpath);
    },
    async readlink() {
      throw Error('read link not supported');
    },
    async symlink() {
      throw Error('sym link not supported');
    },
    async chmod() {
      throw Error('chmod not supported');
    },
  },
};
