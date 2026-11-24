import { normalize } from 'path-browserify';
import type { FileSystemObject } from './fileSystem';
import { RAPID_GIT_CONFIG, usesRapidGitConfig } from './gitMetadata';
import { withTimeout } from './withTimeout';

const adapters = new WeakMap<object, FileSystemObject>();

const FS_OP_WARN_MS = 5_000;
const FS_OP_TIMEOUT_MS = 60_000;

function watchFsOp<T>(label: string, op: Promise<T>): Promise<T> {
  const warn = setTimeout(
    () => console.warn(`[rc5] git fs op still pending after 5s: ${label}`),
    FS_OP_WARN_MS,
  );
  return withTimeout(`git fs op: ${label}`, op, FS_OP_TIMEOUT_MS).finally(() =>
    clearTimeout(warn),
  );
}

/**
 * isomorphic-git hardcodes .git/config. Redirect only browser local config
 * operations; objects, refs, HEAD and the index stay shared with desktop Git.
 * Use this adapter for Git calls, leaving ordinary filesystem access intact.
 */
export function wrapBrowserGitFs(fs: FileSystemObject): FileSystemObject {
  const cached = adapters.get(fs);
  if (cached) return cached;

  const mapPath = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const filepath = normalize(value);
    return usesRapidGitConfig(filepath) && filepath.endsWith('/.git/config')
      ? `${filepath.slice(0, -'config'.length)}${RAPID_GIT_CONFIG}`
      : value;
  };
  const promises = new Proxy(fs.promises, {
    get(target, method) {
      const original = Reflect.get(target, method);
      if (typeof original !== 'function') return original;
      return (...args: unknown[]) => {
        const filepath = typeof args[0] === 'string' ? normalize(args[0]) : '';
        // init creates an unused hooks directory, which Chrome blocks. No Git
        // hook is executed by this app, so no on-disk directory is necessary.
        if (
          method === 'mkdir' &&
          usesRapidGitConfig(filepath) &&
          filepath.endsWith('/.git/hooks')
        ) {
          return Promise.resolve(undefined);
        }
        args[0] = mapPath(args[0]);
        if (method === 'rename' || method === 'copyFile' || method === 'link') {
          args[1] = mapPath(args[1]);
        }
        const result = Reflect.apply(original, target, args);
        // Chrome restricts File System Access under .git, and some restricted
        // operations hang instead of rejecting. Watch local-folder ops so a
        // stall names the exact op/path and fails instead of spinning forever.
        return usesRapidGitConfig(filepath) && result instanceof Promise
          ? watchFsOp(`${String(method)} ${String(args[0])}`, result)
          : result;
      };
    },
  });
  const adapter = new Proxy(fs, {
    get(target, property) {
      return property === 'promises' ? promises : Reflect.get(target, property);
    },
  });
  adapters.set(fs, adapter);
  return adapter;
}
