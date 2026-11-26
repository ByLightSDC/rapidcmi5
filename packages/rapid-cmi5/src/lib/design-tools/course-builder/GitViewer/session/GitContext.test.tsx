import { useContext } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Operation } from '@rapid-cmi5/cmi5-build-common';
import { GitContext, GitContextProvider } from './GitContext';
import {
  initialState as repoState,
  fsType,
} from '../../../../redux/repoManagerReducer';
import { initialStateCourseBuilder } from '../../../../redux/courseBuilderReducer';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));
jest.mock('../utils/gitFsInstance', () => ({
  getFsInstance: () => ({ isElectron: false }),
}));
jest.mock('../utils/gitOperations', () => ({
  GitOperations: jest.fn().mockImplementation(() => mockGitOperator),
}));
jest.mock('./useGitOperations', () => ({
  useGitOperations: () => ({
    resolveGitConfig: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('./usePublishActions', () => ({ usePublishActions: () => ({}) }));
jest.mock('./useCourseOperations', () => ({
  useCourseOperations: () => ({
    getFirstCoursePath: jest.fn().mockResolvedValue(null),
    handleAutoSelectCourse: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('./useGitRepoStatus', () => ({
  useGitRepoStatus: () => ({
    isInMerge: false,
    resolveGitRepoStatus: jest.fn().mockResolvedValue(undefined),
    resolveRemoteRepoStatus: jest.fn().mockResolvedValue(undefined),
    resolvePushStatus: jest.fn().mockResolvedValue(undefined),
  }),
}));

const repo = { repoName: 'course', fileSystemType: fsType.localFileSystem };
const mockGitOperator = {
  gitRepoStatus: jest.fn(),
  gitRepoStatusFast: jest.fn(),
  gitCheckout: jest.fn(),
  gitCreateBranch: jest.fn(),
  clearCache: jest.fn(),
  getCurrentGitBranch: jest.fn().mockResolvedValue('feature/course'),
  getAllGitBranches: jest.fn().mockResolvedValue(['main', 'feature/course']),
};
let mockState: any;

describe('branch changes with saved course data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGitOperator.gitRepoStatusFast.mockResolvedValue([]);
    mockState = {
      repoManager: {
        ...repoState,
        repoAccessObject: repo,
        currentBranch: 'main',
        allBranches: ['main', 'feature/course'],
      },
      courseBuilder: {
        ...initialStateCourseBuilder,
        dirtyDisplay: 0,
        // Navigation may leave bookkeeping entries even after saving.
        courseOperations: { 'lesson/slide.md': Operation.Edit },
      },
    };
  });

  function renderContext() {
    return renderHook(() => useContext(GitContext), {
      wrapper: ({ children }) => (
        <GitContextProvider>{children}</GitContextProvider>
      ),
    });
  }

  it.each(['handleCheckoutBranch', 'handleCreateBranch'] as const)(
    'allows %s when the course is saved despite queued operations',
    async (action) => {
      const { result } = renderContext();
      await act(async () => {
        await result.current[action]('feature/course');
      });
      expect(mockGitOperator.gitRepoStatusFast).toHaveBeenCalledWith(repo);
      const operation =
        action === 'handleCheckoutBranch'
          ? mockGitOperator.gitCheckout
          : mockGitOperator.gitCreateBranch;
      expect(operation).toHaveBeenCalledWith(repo, 'feature/course');
    },
  );

  it.each(['handleCheckoutBranch', 'handleCreateBranch'] as const)(
    'blocks %s when the course really has unsaved edits',
    async (action) => {
      mockState.courseBuilder.dirtyDisplay = 1;
      const { result } = renderContext();
      await expect(result.current[action]('feature/course')).rejects.toThrow(
        'Save your course changes',
      );
      expect(mockGitOperator.gitCheckout).not.toHaveBeenCalled();
      expect(mockGitOperator.gitCreateBranch).not.toHaveBeenCalled();
    },
  );

  it.each(['handleCheckoutBranch', 'handleCreateBranch'] as const)(
    'allows %s with unrelated untracked files',
    async (action) => {
      mockGitOperator.gitRepoStatusFast.mockResolvedValue([
        { name: 'notes.txt', status: 'untracked' },
      ]);
      const { result } = renderContext();
      await act(async () => {
        await result.current[action]('feature/course');
      });
      const operation =
        action === 'handleCheckoutBranch'
          ? mockGitOperator.gitCheckout
          : mockGitOperator.gitCreateBranch;
      expect(operation).toHaveBeenCalledWith(repo, 'feature/course');
    },
  );

  it('can create a branch for saved, uncommitted work', async () => {
    mockGitOperator.gitRepoStatusFast.mockResolvedValue([
      { name: 'lesson.md', status: 'staged' },
    ]);
    const { result } = renderContext();
    await act(async () => {
      await result.current.handleCreateBranch('feature/course');
    });
    expect(mockGitOperator.gitCreateBranch).toHaveBeenCalledWith(
      repo,
      'feature/course',
    );
  });

  it('still protects uncommitted files after the course has been saved', async () => {
    mockGitOperator.gitRepoStatusFast.mockResolvedValue([
      { name: 'lesson.md', status: 'modified' },
    ]);
    const { result } = renderContext();
    await expect(
      result.current.handleCheckoutBranch('feature/course'),
    ).rejects.toThrow('lesson.md (modified)');
    expect(mockGitOperator.gitCheckout).not.toHaveBeenCalled();
  });
});
