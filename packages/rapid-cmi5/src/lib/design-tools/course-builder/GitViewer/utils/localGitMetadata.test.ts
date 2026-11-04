import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { File } from 'node:buffer';
import { Volume, createFsFromVolume } from 'memfs';
import JSZip from 'jszip';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { fsType, RepoAccessObject } from '../../../../redux/repoManagerReducer';
import { GitFS } from './fileSystem';
import { failedMergePath, getRepoPath, GitOperations } from './gitOperations';
import {
  getGitDirectory,
  RAPID_GIT_CONFIG,
  prepareLocalGitDirectory,
} from './gitMetadata';

describe('Local Git metadata', () => {
  const r: RepoAccessObject = {
    repoName: 'course',
    fileSystemType: fsType.localFileSystem,
  };
  const dir = getRepoPath(r);
  const gitdir = getGitDirectory(dir);
  const author = { name: 'Course Author', email: 'author@example.com' };
  let fs: ReturnType<typeof createFsFromVolume>;
  let volume: InstanceType<typeof Volume>;
  let instance: GitFS;
  let ops: GitOperations;
  let blockedWrites: string[];

  beforeEach(() => {
    volume = new Volume();
    fs = createFsFromVolume(volume);
    blockedWrites = [];
    const promises = new Proxy(fs.promises, {
      get(target, method) {
        const original = Reflect.get(target, method);
        if (typeof original !== 'function') return original;
        return (...args: unknown[]) => {
          if (
            ['writeFile', 'mkdir', 'unlink', 'rm', 'rmdir', 'rename'].includes(
              String(method),
            )
          ) {
            const paths =
              method === 'rename' ? args.slice(0, 2) : args.slice(0, 1);
            for (const path of paths) {
              if (typeof path === 'string') rejectProtectedWrite(path);
            }
          }
          return Reflect.apply(original, target, args);
        };
      },
    });
    instance = new GitFS();
    instance.fs = new Proxy(fs, {
      get(target, property) {
        return property === 'promises'
          ? promises
          : Reflect.get(target, property);
      },
    });
    ops = new GitOperations(instance);
  });

  afterEach(() => {
    expect(blockedWrites).toEqual([]);
  });

  function rejectProtectedWrite(path: string) {
    if (
      /\/localFileSystem\/.*\/\.git\/(config|hooks|modules)(\/|$)/.test(path)
    ) {
      blockedWrites.push(path);
      throw Object.assign(new Error(`Chrome blocks writing ${path}`), {
        code: 'EACCES',
      });
    }
  }

  async function commitFile(content = 'Initial course', repo = r) {
    await instance.createFile(repo, 'lesson.md', content);
    await ops.gitStageFile(repo, 'lesson.md');
    await ops.gitCommit(repo, content, author.email, author.name);
  }

  // File System Access handles backed by a separate volume allow us to exercise
  // migration without granting browser permissions or touching a user's files.
  function handle(path: string): FileSystemDirectoryHandle {
    return {
      kind: 'directory',
      name: path.split('/').pop(),
      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const child = `${path}/${name}`;
        if (options?.create) {
          rejectProtectedWrite(child);
          await fs.promises.mkdir(child, { recursive: true });
        }
        try {
          if (!(await fs.promises.stat(child)).isDirectory()) {
            throw new DOMException('Not a directory', 'TypeMismatchError');
          }
        } catch (error) {
          if ((error as { code?: string }).code === 'ENOENT') {
            throw new DOMException('Not found', 'NotFoundError');
          }
          throw error;
        }
        return handle(child);
      },
      async getFileHandle(name: string, options?: { create?: boolean }) {
        const child = `${path}/${name}`;
        if (options?.create) rejectProtectedWrite(child);
        if (!fs.existsSync(child)) {
          if (!options?.create)
            throw new DOMException('Not found', 'NotFoundError');
          await fs.promises.writeFile(child, '');
        }
        return {
          kind: 'file',
          name,
          getFile: async () =>
            new File([(await fs.promises.readFile(child)) as Buffer], name),
          createWritable: async () => {
            rejectProtectedWrite(child);
            return {
              write: async (file: File) =>
                fs.promises.writeFile(
                  child,
                  Buffer.from(await file.arrayBuffer()),
                ),
              close: async () => undefined,
              abort: async () => undefined,
            };
          },
        };
      },
      async removeEntry(name: string, options?: { recursive?: boolean }) {
        await fs.promises.rm(`${path}/${name}`, options);
      },
      async *values() {
        for (const name of await fs.promises.readdir(path)) {
          const parent = handle(path);
          yield (await fs.promises.stat(`${path}/${name}`)).isDirectory()
            ? await parent.getDirectoryHandle(name.toString())
            : await parent.getFileHandle(name.toString());
        }
      },
    } as unknown as FileSystemDirectoryHandle;
  }

  it('persists rapid-config and shares standard Git metadata across reopening', async () => {
    await ops.initGitRepo(r);
    await ops.setGitConfig(r, {
      authorName: author.name,
      authorEmail: author.email,
      remoteRepoUrl: 'https://example.com/course.git',
    });
    await commitFile();
    await instance.updateFile(r, 'lesson.md', 'Staged edit');
    await ops.gitStageFile(r, 'lesson.md');

    const reopened = new GitOperations(instance);
    expect(await reopened.getCurrentGitBranch(r)).toBe('main');
    expect(await reopened.getGitConfig(r)).toEqual({
      authorName: author.name,
      authorEmail: author.email,
      remoteRepoUrl: 'https://example.com/course.git',
    });
    expect(await reopened.gitCommits(r)).toHaveLength(1);
    expect(await reopened.gitRepoStatus(r)).toEqual([
      { name: 'lesson.md', status: 'staged' },
    ]);
    expect(await instance.dirExists(`${dir}/.git`)).toBe(true);
    expect(await instance.fileExists(r, '.git/index')).toBe(true);
    expect(await instance.fileExists(r, `.git/${RAPID_GIT_CONFIG}`)).toBe(true);
    expect(await instance.fileExists(r, '.git/config')).toBe(false);
    expect(await instance.dirExists(`${dir}/.git/hooks`)).toBe(false);
    expect(failedMergePath).toBe('.git/failedMerge.txt');
    expect((await git.log({ fs, dir }))[0].oid).toBe(
      (await reopened.gitCommits(r))[0].oid,
    );
  });

  it('excludes metadata from status, recursive staging, trees and exports', async () => {
    await ops.initGitRepo(r);
    await instance.createFile(r, 'lesson.md', 'Lesson');
    await instance.createFile(r, '.gitignore', '!.*\n');
    await ops.gitStageFile(r, '.');
    expect(await git.listFiles({ fs, dir, gitdir })).toEqual([
      '.gitignore',
      'lesson.md',
    ]);
    await ops.gitStageFile(r, '.git/config');
    expect(await git.listFiles({ fs, dir, gitdir })).toEqual([
      '.gitignore',
      'lesson.md',
    ]);
    expect((await ops.gitRepoStatus(r)).map((file) => file.name)).toEqual([
      '.gitignore',
      'lesson.md',
    ]);
    expect(
      (await instance.getFolderStructure(dir, '')).map((node) => node.name),
    ).toEqual(['.gitignore', 'lesson.md']);
    expect(
      (await instance.getFolderStructureWithMtime(dir, '')).map(
        (node) => node.name,
      ),
    ).toEqual(['.gitignore', 'lesson.md']);
    const zip = await instance.generateRepoZip(r);
    expect(Object.keys(zip.files)).toEqual([
      'course/',
      'course/.gitignore',
      'course/lesson.md',
    ]);
  });

  it('uses rapid-config for stash, diff, unstage, revert and branch reset', async () => {
    await ops.initGitRepo(r);
    await ops.setGitConfig(r, {
      authorName: author.name,
      authorEmail: author.email,
      remoteRepoUrl: '',
    });
    await commitFile();
    await instance.updateFile(r, 'lesson.md', 'Changed');
    expect(await ops.handleGetFileDiff(r, 'lesson.md')).toEqual({
      oldFile: 'Initial course',
      newFile: 'Changed',
    });
    await ops.gitStageFile(r, 'lesson.md');
    await ops.gitUnStageFile(r, 'lesson.md');
    await ops.gitStash(r);
    expect(await ops.gitListStash(r)).toHaveLength(1);
    await ops.gitStashPop(r);
    expect((await instance.getFileContent(r, 'lesson.md'))?.content).toBe(
      'Changed',
    );
    await ops.revertFileToHEAD(r, 'lesson.md');
    expect((await instance.getFileContent(r, 'lesson.md'))?.content).toBe(
      'Initial course',
    );
    const [initial] = await ops.gitCommits(r);
    await commitFile('Second commit');
    await ops.resetBranch(r, 'main', initial.oid);
    expect(await ops.getAllGitBranches(r)).toEqual(['main']);
    expect((await ops.gitCommits(r))[0].oid).toBe(initial.oid);
    expect((await instance.getFileContent(r, 'lesson.md'))?.content).toBe(
      'Initial course',
    );
  });

  it('copies only desktop config and shares existing staged changes and commits', async () => {
    await git.init({ fs, dir, defaultBranch: 'main' });
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://example.com/course.git',
    });
    await git.setConfig({
      fs,
      dir,
      path: 'http.corsProxy',
      value: 'https://proxy.example.com/git',
    });
    await instance.createFile(r, 'lesson.md', 'Legacy staged file');
    await git.add({ fs, dir, filepath: 'lesson.md' });
    const originalIndex = await fs.promises.readFile(`${dir}/.git/index`);
    const originalConfig = await fs.promises.readFile(`${dir}/.git/config`);
    await prepareLocalGitDirectory(handle(dir));
    expect(await fs.promises.readFile(`${gitdir}/${RAPID_GIT_CONFIG}`)).toEqual(
      originalConfig,
    );
    expect(
      await git.getConfig({
        fs: instance.getFs(),
        dir,
        gitdir,
        path: 'http.corsProxy',
      }),
    ).toBe('https://proxy.example.com/git');
    expect(await fs.promises.readFile(`${gitdir}/index`)).toEqual(
      originalIndex,
    );
    expect(await fs.promises.readFile(`${dir}/.git/index`)).toEqual(
      originalIndex,
    );
    await ops.gitCommit(r, 'Migrated commit', author.email, author.name);
    await prepareLocalGitDirectory(handle(dir));
    expect(await ops.gitCommits(r)).toHaveLength(1);
    expect(await git.log({ fs, dir })).toHaveLength(1);
    expect(await fs.promises.readFile(`${gitdir}/config`)).toEqual(
      originalConfig,
    );
  });

  it('keeps rapid-config on reopening and reads recent-project remotes from it', async () => {
    await git.init({ fs, dir });
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://example.com/original.git',
    });
    expect(await instance.getGitRemoteUrl(handle(dir))).toBe(
      'https://example.com/original.git',
    );
    await prepareLocalGitDirectory(handle(dir));
    await git.setConfig({
      fs: instance.getFs(),
      dir,
      path: 'remote.origin.url',
      value: 'https://example.com/current.git',
    });
    await prepareLocalGitDirectory(handle(dir));
    expect(await instance.getGitRemoteUrl(handle(dir))).toBe(
      'https://example.com/current.git',
    );
    expect(await git.getConfig({ fs, dir, path: 'remote.origin.url' })).toBe(
      'https://example.com/original.git',
    );
  });

  it.each([fsType.localFileSystem, fsType.inBrowser])(
    'prefers rapid-config over a retained desktop config when importing into %s',
    async (fileSystemType) => {
      const repo = { ...r, fileSystemType };
      const zip = new JSZip();
      zip.file('course/.git/HEAD', 'ref: refs/heads/main\n');
      zip.file(
        'course/.git/config',
        '[remote "origin"]\nurl = https://example.com/stale.git\n',
      );
      zip.file(
        `course/.git/${RAPID_GIT_CONFIG}`,
        '[remote "origin"]\nurl = https://example.com/current.git\n',
      );
      await instance.importGitRepoZip(zip, repo);
      expect(await ops.listRepoRemotes(repo)).toEqual([
        { remote: 'origin', url: 'https://example.com/current.git' },
      ]);
    },
  );

  it.each([fsType.localFileSystem, fsType.inBrowser])(
    'imports conventional Git archives into %s',
    async (fileSystemType) => {
      const repo = { ...r, fileSystemType };
      const repoPath = getRepoPath(repo);
      const zip = new JSZip();
      zip.file('course/.git/HEAD', 'ref: refs/heads/main\n');
      zip.file('course/.git/config', '[core]\nrepositoryformatversion = 0\n');
      zip.file('course/.git/hooks/pre-commit', 'unused hook');
      zip.file('course/.git/modules/sub/config', 'unused submodule');
      zip.file('course/lesson.md', 'Imported lesson');
      await instance.importGitRepoZip(zip, repo);
      expect(fs.existsSync(`${repoPath}/.git/HEAD`)).toBe(true);
      expect(fs.existsSync(`${repoPath}/.git/${RAPID_GIT_CONFIG}`)).toBe(
        fileSystemType === fsType.localFileSystem,
      );
      expect(fs.existsSync(`${repoPath}/.git/config`)).toBe(
        fileSystemType === fsType.inBrowser,
      );
      expect(await ops.getCurrentGitBranch(repo)).toBe('main');
    },
  );

  it('produces commits readable by native Git without a desktop config', async () => {
    await ops.initGitRepo(r);
    await commitFile();
    const fixture = mkdtempSync(`${tmpdir()}/rapidcmi5-native-`);
    try {
      const entries = volume.toJSON();
      for (const [filepath, content] of Object.entries(entries)) {
        if (!filepath.startsWith(`${dir}/`) || content === null) continue;
        const destination = `${fixture}/${filepath.slice(dir.length + 1)}`;
        mkdirSync(dirname(destination), { recursive: true });
        // Read binary Git objects from the volume rather than the JSON string.
        writeFileSync(destination, fs.readFileSync(filepath) as Buffer);
      }
      const native = (...args: string[]) =>
        execFileSync('git', ['-C', fixture, ...args], {
          encoding: 'utf8',
        }).trim();
      expect(native('log', '-1', '--format=%H')).toBe(
        (await ops.gitCommits(r))[0].oid,
      );
      expect(native('status', '--porcelain')).toBe('');
      expect(native('show', 'HEAD:lesson.md')).toBe('Initial course');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it('retains the original clone error if cleanup also fails', async () => {
    const error = new Error('Original clone failure');
    const request = jest.fn().mockRejectedValue(error);
    ops = new GitOperations(instance, { request });
    jest
      .spyOn(instance, 'deleteRepo')
      .mockRejectedValue(new Error('Cleanup failure'));
    await expect(
      ops.cloneRepo(
        'course',
        fsType.localFileSystem,
        'https://example.com/course.git',
        'main',
        '',
        '',
        false,
      ),
    ).rejects.toBe(error);
  });

  it.each([fsType.localFileSystem, fsType.inBrowser])(
    'authenticates clone, push and pull after a 401 challenge with %s metadata',
    async (fileSystemType) => {
      const repo = { ...r, fileSystemType };
      const repoPath = getRepoPath(repo);
      const credentials = {
        username: 'fixture-user',
        password: 'fixture-token',
      };
      const expectedAuthorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;
      let challenges = 0;
      const fixture = mkdtempSync(`${tmpdir()}/rapidcmi5-git-`);
      const nativeGit = (...args: string[]) =>
        execFileSync('git', ['-C', fixture, ...args], {
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      const request: typeof http.request = async ({
        url,
        method,
        body,
        headers = {},
      }): Promise<Awaited<ReturnType<typeof http.request>>> => {
        if (
          (headers['Authorization'] ?? headers['authorization']) !==
          expectedAuthorization
        ) {
          challenges++;
          return {
            url,
            statusCode: 401,
            statusMessage: 'Unauthorized',
            headers: { 'www-authenticate': 'Basic realm="GitLab"' },
            body: (async function* () {
              yield new TextEncoder().encode('HTTP Basic: Access denied');
            })(),
          };
        }
        const parsed = new URL(url);
        const service =
          parsed.searchParams.get('service') ??
          parsed.pathname.split('/').pop();
        if (!service) throw new Error('Missing fixture Git service');
        const command = service.replace('git-', '');
        let input = Buffer.alloc(0);
        if (body) {
          const chunks = [];
          for await (const chunk of body) chunks.push(Buffer.from(chunk));
          input = Buffer.concat(chunks);
        }
        const output = execFileSync(
          'git',
          [
            command,
            '--stateless-rpc',
            ...(method === 'GET' ? ['--advertise-refs'] : []),
            fixture,
          ],
          { input, stdio: ['pipe', 'pipe', 'pipe'] },
        );
        const serviceLine = `# service=${service}\n`;
        const prefix =
          method === 'GET'
            ? Buffer.from(
                `${(serviceLine.length + 4).toString(16).padStart(4, '0')}${serviceLine}0000`,
              )
            : Buffer.alloc(0);
        return {
          url,
          method: method ?? 'GET',
          statusCode: 200,
          statusMessage: 'OK',
          headers: {
            'content-type': `application/x-${service}-${method === 'GET' ? 'advertisement' : 'result'}`,
          },
          body: (async function* () {
            yield new Uint8Array(Buffer.concat([prefix, output]));
          })(),
        };
      };
      try {
        nativeGit('init', '-b', 'main');
        writeFileSync(`${fixture}/lesson.md`, 'Remote lesson');
        nativeGit('add', '.');
        nativeGit(
          '-c',
          `user.name=${author.name}`,
          '-c',
          `user.email=${author.email}`,
          'commit',
          '-m',
          'Initial remote',
        );
        nativeGit('config', 'receive.denyCurrentBranch', 'ignore');
        ops = new GitOperations(instance, { request });
        await ops.cloneRepo(
          'course',
          fileSystemType,
          'https://fixture.test/course.git',
          'main',
          credentials.username,
          credentials.password,
          false,
        );
        expect(await instance.dirExists(getGitDirectory(repoPath))).toBe(true);
        expect(await instance.dirExists(`${repoPath}/.git`)).toBe(true);
        expect(
          await instance.fileExists(repo, `.git/${RAPID_GIT_CONFIG}`),
        ).toBe(fileSystemType === fsType.localFileSystem);
        expect(await instance.fileExists(repo, '.git/config')).toBe(
          fileSystemType === fsType.inBrowser,
        );
        await ops.setGitConfig(repo, {
          authorName: author.name,
          authorEmail: author.email,
          remoteRepoUrl: '',
        });
        await commitFile('Local change', repo);
        await ops.gitPush(
          repo,
          credentials.username,
          credentials.password,
          false,
        );
        expect(nativeGit('show', 'HEAD:lesson.md').toString()).toBe(
          'Local change',
        );
        nativeGit('reset', '--hard', 'HEAD');
        writeFileSync(`${fixture}/lesson.md`, 'New remote change');
        nativeGit('add', '.');
        nativeGit(
          '-c',
          `user.name=${author.name}`,
          '-c',
          `user.email=${author.email}`,
          'commit',
          '-m',
          'Remote update',
        );
        await ops.gitPull(
          repo,
          'main',
          credentials.username,
          credentials.password,
          false,
        );
        expect(
          (await instance.getFileContent(repo, 'lesson.md'))?.content,
        ).toBe('New remote change');
        expect(await new GitOperations(instance).gitCommits(repo)).toHaveLength(
          3,
        );
        expect(challenges).toBe(3);
      } finally {
        rmSync(fixture, { recursive: true, force: true });
      }
    },
  );
});
