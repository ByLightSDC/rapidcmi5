import type { FileSystem } from '@zenfs/core';

/**
 * WebAccess adds the directory inode before its File System Access handle is
 * ready. Git checkout creates directories concurrently, so a child can see its
 * parent's inode and still fail to open its handle. Queue backend mkdir calls
 * until both parts of each directory have finished being created.
 */
export function serializeDirectoryCreation<T extends Pick<FileSystem, 'mkdir'>>(
  fs: T,
): T {
  const mkdir = fs.mkdir.bind(fs);
  let pending = Promise.resolve();

  fs.mkdir = (...args) => {
    const result = pending.then(() => mkdir(...args));
    // Keep the queue usable after EEXIST, ENOENT, or another failed mkdir.
    pending = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };

  return fs;
}
