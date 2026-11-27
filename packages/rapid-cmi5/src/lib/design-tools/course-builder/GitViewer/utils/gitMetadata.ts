import { join, normalize } from 'path-browserify';
import { StepTimeoutError } from './withTimeout';

export const STANDARD_GIT_DIRECTORY = '.git';
export const BROWSER_GIT_DIRECTORY = '.rapid-git';
export const GIT_MIGRATION_MARKER = 'migration-in-progress';
// This file ignores itself and all metadata in desktop Git clients too.
export const BROWSER_GIT_IGNORE = '*\n';
const MIGRATION_IDLE_TIMEOUT_MS = 15_000;
let pendingMigration: Promise<void> = Promise.resolve();
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

async function fileIfExists(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemFileHandle | undefined> {
  try {
    return await parent.getFileHandle(name);
  } catch (error) {
    if ((error as DOMException).name === 'NotFoundError') return undefined;
    throw error;
  }
}

export async function getLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle | undefined> {
  const browser = await directoryIfExists(parent, BROWSER_GIT_DIRECTORY);
  if (browser && !(await hasMigrationMarker(browser))) return browser;
  return (await directoryIfExists(parent, STANDARD_GIT_DIRECTORY)) ?? browser;
}

async function hasMigrationMarker(directory: FileSystemDirectoryHandle) {
  return (await fileIfExists(directory, GIT_MIGRATION_MARKER)) !== undefined;
}

export async function getLocalGitConfig(
  gitDir: FileSystemDirectoryHandle,
): Promise<FileSystemFileHandle> {
  if (gitDir.name === STANDARD_GIT_DIRECTORY) {
    const legacyConfig = await fileIfExists(gitDir, RAPID_GIT_CONFIG);
    if (legacyConfig) return legacyConfig;
  }
  return gitDir.getFileHandle('config');
}

async function copyFile(
  source: FileSystemFileHandle,
  parent: FileSystemDirectoryHandle,
  name: string,
  onProgress: () => void,
) {
  const file = await source.getFile();
  onProgress();
  const target = await parent.getFileHandle(name, { create: true });
  onProgress();
  const writable = await target.createWritable();
  onProgress();
  try {
    await writable.write(file);
    onProgress();
    await writable.close();
    onProgress();
  } catch (error) {
    await writable.abort().catch(() => undefined);
    throw error;
  }
}

async function copyDirectory(
  source: FileSystemDirectoryHandle,
  target: FileSystemDirectoryHandle,
  onProgress: () => void,
) {
  // Never copy embedded Git metadata or executable hooks into the browser repo.
  // @ts-ignore FileSystemDirectoryHandle.values is not in older DOM typings.
  for await (const entry of source.values()) {
    onProgress();
    if (isGitMetadataPath(entry.name)) continue;
    if (entry.kind === 'directory') {
      await copyDirectory(
        entry as FileSystemDirectoryHandle,
        await target.getDirectoryHandle(entry.name, { create: true }),
        onProgress,
      );
    } else {
      await copyFile(
        entry as FileSystemFileHandle,
        target,
        entry.name,
        onProgress,
      );
    }
  }
}

/**
 * Keep ownership until the actual copy settles, even if its caller times out.
 * Web Locks also serialize migrations from other tabs of the same origin.
 */
export function prepareLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let watching = true;
  let onProgress!: () => void;
  const stalled = new Promise<never>((_, reject) => {
    onProgress = () => {
      if (!watching) return;
      clearTimeout(timer);
      timer = setTimeout(
        () =>
          reject(
            new StepTimeoutError(
              'copying the project Git metadata',
              MIGRATION_IDLE_TIMEOUT_MS,
            ),
          ),
        MIGRATION_IDLE_TIMEOUT_MS,
      );
    };
    onProgress();
  });
  const migration = pendingMigration.then(async () => {
    const copy = () => migrateLocalGitDirectory(parent, onProgress);
    if (typeof navigator !== 'undefined' && navigator.locks) {
      await navigator.locks.request('rapid-cmi5:git-metadata-migration', copy);
    } else {
      await copy();
    }
  });
  pendingMigration = migration.catch(() => undefined);
  return Promise.race([migration, stalled]).finally(() => {
    watching = false;
    clearTimeout(timer);
  });
}

async function ignoreBrowserGitDirectory(
  directory: FileSystemDirectoryHandle,
  onProgress: () => void,
) {
  const file = await directory.getFileHandle('.gitignore', { create: true });
  const writable = await file.createWritable();
  try {
    await writable.write(BROWSER_GIT_IGNORE);
    onProgress();
    await writable.close();
    onProgress();
  } catch (error) {
    await writable.abort().catch(() => undefined);
    throw error;
  }
}

/** Copy legacy metadata once. Desktop .git remains untouched and independent. */
async function migrateLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
  onProgress: () => void,
): Promise<void> {
  const existing = await directoryIfExists(parent, BROWSER_GIT_DIRECTORY);
  const interrupted = existing && (await hasMigrationMarker(existing));
  if (existing && !interrupted) {
    await existing.getFileHandle('HEAD');
    await existing.getFileHandle('config');
    await ignoreBrowserGitDirectory(existing, onProgress);
    return;
  }
  const source = await directoryIfExists(parent, STANDARD_GIT_DIRECTORY);
  if (!source) {
    throw new Error(
      interrupted
        ? 'Git migration is incomplete. Restore the original .git directory to retry the migration.'
        : 'The selected directory does not contain a .rapid-git or .git directory. Please choose a valid Rapid CMI5 project.',
    );
  }
  const head = await source.getFileHandle('HEAD');
  const config = await getLocalGitConfig(source);
  onProgress();
  // Validate the source before discarding a previous, incomplete copy.
  if (interrupted) {
    await parent.removeEntry(BROWSER_GIT_DIRECTORY, { recursive: true });
  }
  const target = await parent.getDirectoryHandle(BROWSER_GIT_DIRECTORY, {
    create: true,
  });
  try {
    // Persist before copying anything so a closed/reloaded tab can retry safely.
    await target.getFileHandle(GIT_MIGRATION_MARKER, { create: true });
    onProgress();
    await ignoreBrowserGitDirectory(target, onProgress);
    // Read known data paths directly: Chromium may hide .git during enumeration.
    // Exclude hooks, modules, worktrees and other desktop indirection metadata.
    for (const name of ['objects', 'refs', 'logs']) {
      const directory = await directoryIfExists(source, name);
      if (directory) {
        await copyDirectory(
          directory,
          await target.getDirectoryHandle(name, { create: true }),
          onProgress,
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
      const file = await fileIfExists(source, name);
      if (file) await copyFile(file, target, name, onProgress);
    }
    const info = await directoryIfExists(source, 'info');
    const exclude = info && (await fileIfExists(info, 'exclude'));
    if (exclude) {
      await copyFile(
        exclude,
        await target.getDirectoryHandle('info', { create: true }),
        'exclude',
        onProgress,
      );
    }
    await copyFile(config, target, 'config', onProgress);
    await copyFile(head, target, 'HEAD', onProgress);
    await target.removeEntry(GIT_MIGRATION_MARKER);
  } catch (error) {
    await parent
      .removeEntry(BROWSER_GIT_DIRECTORY, { recursive: true })
      .catch(() => undefined);
    throw error;
  }
}
