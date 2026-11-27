import type { FileSystemObject } from './fileSystem';
import { isBrowserLocalPath, isGitMetadataPath } from './gitMetadata';
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
 * Hide Git metadata from working-tree directory listings in browser storage
 * and local folders. Time out Git operations on browser-mounted local folders
 * so stalled File System Access handles produce useful errors.
 */
export function wrapBrowserGitFs(fs: FileSystemObject): FileSystemObject {
  const cached = adapters.get(fs);
  if (cached) return cached;

  const promises = new Proxy(fs.promises, {
    get(target, method) {
      const original = Reflect.get(target, method);
      if (typeof original !== 'function') return original;
      return (...args: unknown[]) => {
        const filepath = typeof args[0] === 'string' ? args[0] : '';
        const operation = Reflect.apply(original, target, args);
        // Git normally ignores .git itself. Also hide our custom directory
        // during working-tree walks, including recursive add and stash.
        const result =
          method === 'readdir'
            ? Promise.resolve(operation as Promise<string[]>).then((entries) =>
                entries.filter((entry) => !isGitMetadataPath(String(entry))),
              )
            : operation;
        return isBrowserLocalPath(filepath) && result instanceof Promise
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
