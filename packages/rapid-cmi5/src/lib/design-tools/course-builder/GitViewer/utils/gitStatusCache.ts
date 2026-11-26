import * as git from 'isomorphic-git';
import { join } from 'path-browserify';
import type { ModifiedFile } from '../Components/GitActions/GitFileStatus';
import type { RepoAccessObject } from '../../../../redux/repoManagerReducer';
import { GitFS, getRepoPath } from './fileSystem';
import { getGitDirectory, isGitMetadataPath } from './gitMetadata';

type FileStamp = { signature: string; dataSignature: string; mtime: number };
type Snapshot = {
  identity: string;
  files: Map<string, FileStamp>;
  status: ModifiedFile[];
  verifiedAt: number;
};
// Share verified status between the drawer and the branch preflight, even when
// React creates a new GitOperations instance. Never share between filesystems.
const snapshots = new WeakMap<GitFS, Map<string, Snapshot>>();

export async function getCachedGitStatus(
  instance: GitFS,
  repo: RepoAccessObject,
  scan: (paths?: string[]) => Promise<ModifiedFile[]>,
): Promise<ModifiedFile[]> {
  const dir = getRepoPath(repo);
  const gitdir = getGitDirectory(dir, instance.isElectron);
  const fs = instance.getFs();
  const verifiedAt = Date.now();
  const files = new Map<string, FileStamp>();
  const copy = (status: ModifiedFile[]) => status.map((file) => ({ ...file }));
  const digest = async (path: string) => {
    try {
      const bytes = await fs.promises.readFile(join(gitdir, path));
      return (await git.hashBlob({ object: bytes as Uint8Array })).oid;
    } catch (error: any) {
      if (error.code === 'ENOENT') return 'missing';
      throw error;
    }
  };
  const identity = async () => {
    let head: string;
    try {
      head = await git.resolveRef({ fs, dir, gitdir, ref: 'HEAD' });
    } catch (error: any) {
      if (error.code !== 'NotFoundError') throw error;
      head = 'unborn';
    }
    return [
      head,
      ...(await Promise.all(
        ['HEAD', 'index', 'config', 'info/exclude'].map(digest),
      )),
    ].join(':');
  };
  const walk = async (relative = '') => {
    const entries = await fs.promises.readdir(join(dir, relative));
    for (const entry of entries) {
      const path = join(relative, String(entry));
      if (isGitMetadataPath(path)) continue;
      const stat = await fs.promises.lstat(join(dir, path));
      if (stat.isDirectory()) await walk(path);
      else
        files.set(path, {
          signature: [stat.mtimeMs, stat.ctimeMs, stat.size, stat.mode].join(
            ':',
          ),
          dataSignature: [stat.mtimeMs, stat.size, stat.mode].join(':'),
          mtime: Number(stat.mtimeMs),
        });
    }
  };

  const repos = snapshots.get(instance) ?? new Map<string, Snapshot>();
  snapshots.set(instance, repos);
  const previous = repos.get(dir);
  const before = await identity();
  await walk();
  const candidates = new Set<string>();
  if (previous) {
    for (const [path, stamp] of files) {
      const old = previous.files.get(path);
      // Recheck recent/coarse timestamps (racy writes), missing timestamps,
      // and changes in size, permissions or ctime, including backdated edits.
      if (
        !old ||
        old.signature !== stamp.signature ||
        !stamp.mtime ||
        stamp.mtime >= previous.verifiedAt - 1000
      )
        candidates.add(path);
    }
    for (const path of previous.files.keys()) {
      if (!files.has(path)) candidates.add(path);
    }
  }
  const fullScan =
    !previous ||
    before !== previous.identity ||
    [...candidates].some((path) => path.split('/').pop() === '.gitignore');
  let status: ModifiedFile[];
  if (fullScan) status = await scan();
  else if (candidates.size) {
    const changed = await scan([...candidates]);
    status = [
      ...previous.status.filter((file) => !candidates.has(file.name)),
      ...changed,
    ];
  } else status = previous.status;
  // Some virtual filesystems update ctime when a read refreshes access metadata.
  // Cache post-read stamps, while refusing a scan whose file data changed during it.
  if (fullScan || candidates.size) {
    for (const path of fullScan ? files.keys() : candidates) {
      const beforeRead = files.get(path);
      if (!beforeRead) continue;
      const stat = await fs.promises.lstat(join(dir, path));
      const dataSignature = [stat.mtimeMs, stat.size, stat.mode].join(':');
      if (dataSignature !== beforeRead.dataSignature) {
        throw Error(
          `File changed while checking Git status: ${path}. Please try again.`,
        );
      }
      files.set(path, {
        ...beforeRead,
        signature: [stat.mtimeMs, stat.ctimeMs, stat.size, stat.mode].join(':'),
      });
    }
  }
  // Git may refresh index stat information while checking status. Keep its
  // resulting identity so that a read-only refresh doesn't force another scan.
  const after = fullScan || candidates.size ? await identity() : before;
  repos.set(dir, { identity: after, files, status: copy(status), verifiedAt });
  return copy(status);
}
