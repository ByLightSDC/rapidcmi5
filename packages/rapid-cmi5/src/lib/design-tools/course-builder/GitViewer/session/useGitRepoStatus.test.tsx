import { act, renderHook } from '@testing-library/react';
import { useGitRepoStatus } from './useGitRepoStatus';
import { GitFS } from '../utils/fileSystem';
import { GitOperations } from '../utils/gitOperations';
import { fsType } from '../../../../redux/repoManagerReducer';

jest.mock('react-redux', () => ({
  useSelector: () => ({ currentBranch: 'main' }),
}));
jest.mock('../utils/gitOperations', () => ({
  GitOperations: jest.fn().mockImplementation(() => mockGitOperator),
}));

const mockGitOperator = {
  gitResolveFile: jest.fn(),
  gitRepoStatus: jest.fn(),
  gitCommits: jest.fn(),
  gitListStash: jest.fn().mockResolvedValue([]),
  getStashStatus: jest.fn().mockResolvedValue(undefined),
};
const repo = { repoName: 'course', fileSystemType: fsType.localFileSystem };

describe('staging status updates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reuses bulk staging results without scanning files or reloading history', async () => {
    const fs = { getFolderStructureWithMtime: jest.fn() } as unknown as GitFS;
    const { result } = renderHook(() => useGitRepoStatus(repo, false, fs));
    await act(async () => {
      await result.current.resolveFile(
        repo,
        ['lesson.md', 'other.md'],
        [
          { name: 'lesson.md', status: 'untracked' },
          { name: 'other.md', status: 'modified' },
        ],
      );
    });
    await act(async () => {
      await result.current.resolveFile(
        repo,
        ['lesson.md'],
        [{ name: 'lesson.md', status: 'staged' }],
      );
    });
    expect(result.current.modifiedFiles).toEqual([
      { name: 'other.md', status: 'modified' },
      { name: 'lesson.md', status: 'staged' },
    ]);
    expect(result.current.numStaged).toBe(1);
    expect(result.current.canCommit).toBe(true);
    expect(GitOperations).toHaveBeenCalledTimes(1);
    expect(fs.getFolderStructureWithMtime).not.toHaveBeenCalled();
    expect(mockGitOperator.gitRepoStatus).not.toHaveBeenCalled();
    expect(mockGitOperator.gitCommits).not.toHaveBeenCalled();
    expect(mockGitOperator.gitResolveFile).not.toHaveBeenCalled();
  });

  it('checks only the selected file and refreshes stash actions once', async () => {
    mockGitOperator.gitResolveFile.mockResolvedValue({
      name: 'lesson.md',
      status: 'staged',
    });
    const { result } = renderHook(() =>
      useGitRepoStatus(repo, true, {} as GitFS),
    );
    await act(async () => {});
    mockGitOperator.gitListStash.mockClear();
    mockGitOperator.getStashStatus.mockClear();
    await act(async () => {
      await result.current.resolveFile(repo, 'lesson.md');
    });
    expect(mockGitOperator.gitResolveFile).toHaveBeenCalledWith(
      repo,
      'lesson.md',
    );
    expect(mockGitOperator.gitListStash).toHaveBeenCalledTimes(1);
    expect(mockGitOperator.getStashStatus).toHaveBeenCalledTimes(1);
    expect(mockGitOperator.gitRepoStatus).not.toHaveBeenCalled();
    expect(result.current.numStaged).toBe(1);
  });

  it('removes files no longer changed without dropping unrelated changes', async () => {
    const { result } = renderHook(() =>
      useGitRepoStatus(repo, false, {} as GitFS),
    );
    await act(async () => {
      await result.current.resolveFile(
        repo,
        ['deleted.md', 'other.md'],
        [
          { name: 'deleted.md', status: 'added_then_deleted' },
          { name: 'other.md', status: 'modified' },
        ],
      );
    });
    await act(async () => {
      await result.current.resolveFile(repo, ['deleted.md'], []);
    });
    expect(result.current.modifiedFiles).toEqual([
      { name: 'other.md', status: 'modified' },
    ]);
    expect(result.current.canCommit).toBe(false);
  });
});
