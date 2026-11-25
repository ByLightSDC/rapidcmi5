import { join, normalize } from 'path-browserify';

export const STANDARD_GIT_DIRECTORY = '.git';
export const BROWSER_GIT_DIRECTORY = '.rapid-git';
// Configuration name used by older browser projects inside .git.
export const RAPID_GIT_CONFIG = 'rapid-config';

export const isGitMetadataPath = (filepath: string): boolean =>
  normalize(filepath)
    .split('/')
    .some(
      (part) =>
        part === STANDARD_GIT_DIRECTORY || part === BROWSER_GIT_DIRECTORY,
    );

export const getGitDirectory = (dir: string, isElectron = false) =>
  join(dir, isElectron ? STANDARD_GIT_DIRECTORY : BROWSER_GIT_DIRECTORY);

export const getFailedMergePath = (isElectron = false) =>
  join(getGitDirectory('', isElectron), 'failedMerge.txt');

export const isBrowserLocalPath = (dir: string) =>
  normalize(dir).startsWith('/localFileSystem/');

async function directoryIfExists(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    return await parent.getDirectoryHandle(name);
  } catch (error) {
    if ((error as DOMException).name === 'NotFoundError') return undefined;
    throw error;
  }
}

export async function getLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle | undefined> {
  return (
    (await directoryIfExists(parent, BROWSER_GIT_DIRECTORY)) ??
    directoryIfExists(parent, STANDARD_GIT_DIRECTORY)
  );
}

export async function getLocalGitConfig(
  gitDir: FileSystemDirectoryHandle,
): Promise<FileSystemFileHandle> {
  if (gitDir.name === STANDARD_GIT_DIRECTORY) {
    try {
      return await gitDir.getFileHandle(RAPID_GIT_CONFIG);
    } catch (error) {
      if ((error as DOMException).name !== 'NotFoundError') throw error;
    }
  }
  return gitDir.getFileHandle('config');
}

async function copyFile(
  source: FileSystemFileHandle,
  parent: FileSystemDirectoryHandle,
  name: string,
) {
  const file = await source.getFile();
  const target = await parent.getFileHandle(name, { create: true });
  const writable = await target.createWritable();
  try {
    await writable.write(file);
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => undefined);
    throw error;
  }
}

async function copyDirectory(
  source: FileSystemDirectoryHandle,
  target: FileSystemDirectoryHandle,
) {
  // Never copy embedded Git metadata or executable hooks into the browser repo.
  // @ts-ignore FileSystemDirectoryHandle.values is not in older DOM typings.
  for await (const entry of source.values()) {
    if (isGitMetadataPath(entry.name)) continue;
    if (entry.kind === 'directory') {
      await copyDirectory(
        entry,
        await target.getDirectoryHandle(entry.name, { create: true }),
      );
    } else {
      await copyFile(entry, target, entry.name);
    }
  }
}

/** Copy legacy metadata once. Desktop .git remains untouched and independent. */
export async function prepareLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
): Promise<void> {
  const existing = await directoryIfExists(parent, BROWSER_GIT_DIRECTORY);
  if (existing) {
    await existing.getFileHandle('HEAD');
    await existing.getFileHandle('config');
    return;
  }
  const source = await directoryIfExists(parent, STANDARD_GIT_DIRECTORY);
  if (!source) {
    throw new Error(
      'The selected directory does not contain a .rapid-git or .git directory. Please choose a valid Rapid CMI5 project.',
    );
  }
  const head = await source.getFileHandle('HEAD');
  const config = await getLocalGitConfig(source);
  const target = await parent.getDirectoryHandle(BROWSER_GIT_DIRECTORY, {
    create: true,
  });
  try {
    // Read known data paths directly: Chromium may hide .git during enumeration.
    // Exclude hooks, modules, worktrees and other desktop indirection metadata.
    for (const name of ['objects', 'refs', 'logs']) {
      const directory = await directoryIfExists(source, name);
      if (directory) {
        await copyDirectory(
          directory,
          await target.getDirectoryHandle(name, { create: true }),
        );
      }
    }
    for (const name of [
      'index',
      'packed-refs',
      'shallow',
      'ORIG_HEAD',
      'FETCH_HEAD',
      'failedMerge.txt',
    ]) {
      let file: FileSystemFileHandle;
      try {
        file = await source.getFileHandle(name);
      } catch (error) {
        if ((error as DOMException).name === 'NotFoundError') continue;
        throw error;
      }
      await copyFile(file, target, name);
    }
    await copyFile(config, target, 'config');
    await copyFile(head, target, 'HEAD');
  } catch (error) {
    await parent
      .removeEntry(BROWSER_GIT_DIRECTORY, { recursive: true })
      .catch(() => undefined);
    throw error;
  }
}
