import { join, normalize } from 'path-browserify';

export const STANDARD_GIT_DIRECTORY = '.git';
export const RAPID_GIT_CONFIG = 'rapid-config';

export const isGitMetadataPath = (filepath: string): boolean =>
  normalize(filepath).split('/').includes(STANDARD_GIT_DIRECTORY);

export const getGitDirectory = (dir: string) =>
  join(dir, STANDARD_GIT_DIRECTORY);

export const usesRapidGitConfig = (dir: string, isElectron = false) =>
  !isElectron && normalize(dir).startsWith('/localFileSystem/');

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
  return directoryIfExists(parent, STANDARD_GIT_DIRECTORY);
}

export async function getLocalGitConfig(
  gitDir: FileSystemDirectoryHandle,
): Promise<FileSystemFileHandle> {
  try {
    return await gitDir.getFileHandle(RAPID_GIT_CONFIG);
  } catch (error) {
    if ((error as DOMException).name !== 'NotFoundError') throw error;
    return gitDir.getFileHandle('config');
  }
}

/** Seed browser configuration once, without writing the desktop configuration. */
export async function prepareLocalGitDirectory(
  parent: FileSystemDirectoryHandle,
): Promise<void> {
  const gitDir = await getLocalGitDirectory(parent);
  if (!gitDir) {
    throw new Error(
      'The selected directory does not contain a .git directory. Please choose a valid Rapid CMI5 project.',
    );
  }
  await gitDir.getFileHandle('HEAD');
  const source = await getLocalGitConfig(gitDir);
  if (source.name === RAPID_GIT_CONFIG) return;

  const content = await source.getFile();
  const target = await gitDir.getFileHandle(RAPID_GIT_CONFIG, { create: true });
  let writable: FileSystemWritableFileStream | undefined;
  try {
    writable = await target.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    await writable?.abort().catch(() => undefined);
    // Remove the newly created placeholder so reopening can retry the copy.
    await gitDir.removeEntry(RAPID_GIT_CONFIG).catch(() => undefined);
    throw error;
  }
}
