import type { FileSystem } from '@zenfs/core';
import { dirname, normalize } from 'path-browserify';

/** Wait for in-flight parent handles without serializing unrelated folders. */
export function serializeDirectoryCreation<T extends Pick<FileSystem, 'mkdir'>>(
  fs: T,
): T {
  const mkdir = fs.mkdir.bind(fs);
  const pending = new Map<string, Promise<void>>();

  fs.mkdir = (...args) => {
    const path = normalize(args[0]);
    const dependencies: Promise<void>[] = [];
    // Include this path to serialize duplicate requests and every parent to
    // keep WebAccess's inode/handle creation race protection.
    for (let ancestor = path; ; ancestor = dirname(ancestor)) {
      const dependency = pending.get(ancestor);
      if (dependency) dependencies.push(dependency);
      if (dirname(ancestor) === ancestor) break;
    }
    const result = Promise.all(dependencies).then(() => mkdir(...args));
    const settled = result.then(
      () => undefined,
      () => undefined,
    );
    pending.set(path, settled);
    void settled.then(() => {
      if (pending.get(path) === settled) pending.delete(path);
    });
    return result;
  };

  return fs;
}
