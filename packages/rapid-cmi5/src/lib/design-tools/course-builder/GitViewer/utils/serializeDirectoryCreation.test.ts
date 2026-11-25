import type { FileSystem, Inode } from '@zenfs/core';
import { serializeDirectoryCreation } from './serializeDirectoryCreation';

describe('serializeDirectoryCreation', () => {
  it('waits for a parent handle before creating nested course directories', async () => {
    let finishParent!: () => void;
    const parentReady = new Promise<void>((resolve) => {
      finishParent = resolve;
    });
    const handles = new Set(['/']);
    const mkdir = jest.fn<
      ReturnType<FileSystem['mkdir']>,
      Parameters<FileSystem['mkdir']>
    >(async (path) => {
      const parent = path.substring(0, path.lastIndexOf('/')) || '/';
      if (!handles.has(parent)) {
        throw Object.assign(new Error('Parent handle is missing'), {
          code: 'ENOENT',
        });
      }
      if (path === '/Security+') await parentReady;
      handles.add(path);
      return {} as Inode;
    });
    const fs = serializeDirectoryCreation({ mkdir });
    const options = { mode: 0o777, uid: 0, gid: 0 };

    const parent = fs.mkdir('/Security+', options);
    const lesson = fs.mkdir('/Security+/introduction-test', options);
    const assets = fs.mkdir('/Security+/introduction-test/Assets', options);

    await Promise.resolve();
    expect(mkdir).toHaveBeenCalledTimes(1);
    finishParent();
    await Promise.all([parent, lesson, assets]);

    expect(handles.has('/Security+/introduction-test/Assets')).toBe(true);
  });

  it('preserves errors and continues processing directories after a failure', async () => {
    const error = Object.assign(new Error('Already exists'), {
      code: 'EEXIST',
    });
    const inode = {} as Inode;
    const mkdir = jest
      .fn<ReturnType<FileSystem['mkdir']>, Parameters<FileSystem['mkdir']>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(inode);
    const fs = serializeDirectoryCreation({ mkdir });
    const options = { mode: 0o777, uid: 0, gid: 0 };

    const existing = fs.mkdir('/existing', options);
    const next = fs.mkdir('/next', options);

    await expect(existing).rejects.toBe(error);
    await expect(next).resolves.toBe(inode);
    expect(mkdir).toHaveBeenLastCalledWith('/next', options);
  });
});

describe('directory creation concurrency', () => {
  const options = { mode: 0o777, uid: 0, gid: 0 };

  it('allows independent Git object directories to proceed concurrently', async () => {
    let finishFirst!: () => void;
    const firstReady = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    const mkdir = jest.fn<
      ReturnType<FileSystem['mkdir']>,
      Parameters<FileSystem['mkdir']>
    >(async (path) => {
      if (path === '/.rapid-git/objects/aa') await firstReady;
      return {} as Inode;
    });
    const fs = serializeDirectoryCreation({ mkdir });
    const first = fs.mkdir('/.rapid-git/objects/aa', options);
    const second = fs.mkdir('/.rapid-git/objects/bb', options);
    try {
      await second;
      expect(mkdir).toHaveBeenCalledWith('/.rapid-git/objects/aa', options);
      expect(mkdir).toHaveBeenCalledWith('/.rapid-git/objects/bb', options);
    } finally {
      finishFirst();
      await first;
    }
  });

  it('serializes duplicate paths while other paths remain independent', async () => {
    let finishFirst!: () => void;
    const firstReady = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    const mkdir = jest
      .fn<ReturnType<FileSystem['mkdir']>, Parameters<FileSystem['mkdir']>>()
      .mockImplementationOnce(async () => {
        await firstReady;
        return {} as Inode;
      })
      .mockResolvedValue({} as Inode);
    const fs = serializeDirectoryCreation({ mkdir });
    const first = fs.mkdir('/objects/aa', options);
    const duplicate = fs.mkdir('/objects/aa', options);
    const independent = fs.mkdir('/objects/bb', options);
    try {
      await independent;
      expect(mkdir.mock.calls.map(([path]) => path)).toEqual([
        '/objects/aa',
        '/objects/bb',
      ]);
    } finally {
      finishFirst();
      await Promise.all([first, duplicate]);
    }
    expect(mkdir.mock.calls.map(([path]) => path)).toEqual([
      '/objects/aa',
      '/objects/bb',
      '/objects/aa',
    ]);
  });
});
