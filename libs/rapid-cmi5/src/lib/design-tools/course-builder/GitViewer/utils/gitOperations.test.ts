import { vol } from 'memfs';
import { createFsFromVolume } from 'memfs';
import { getRepoPath, GitOperations } from './gitOperations';
import * as git from 'isomorphic-git';
import {
  RepoAccessObject,
  fsType,
  initFileState,
} from 'libs/rapid-cmi5/src/lib/redux/repoManagerReducer';
import { createNewFsInstance } from './gitFsInstance';
import { join } from 'path-browserify';
import {
  createAndVerifyLesson,
  createTestCourse,
  syncCourseToFs,
  TestContext,
  verifyCourseStructure,
} from './courseOperations.test';
import { Operation } from '@rapid-cmi5/types/cmi5';
import { repoNameInUseMessage } from '../session/constants';

// Add fetch polyfill for Node.js
global.fetch = require('node-fetch');

// ============================================================================
// Test Fixtures and Setup
// ============================================================================

const memfs = createFsFromVolume(vol);

const DEFAULT_REPO: RepoAccessObject = {
  fileSystemType: fsType.inBrowser,
  repoName: 'test-repo',
};

const DEFAULT_GIT_CONFIG = {
  authorName: 'Test User',
  authorEmail: 'test@example.com',
  remoteRepoUrl: '',
};
export const PUBLIC_TEST_REPO =
  'https://github.com/aaiirr123/rapid-cmi5-test-course.git';
const MOCK_CREDENTIALS = {
  username: 'testuser',
  password: 'testpass',
};

// ============================================================================
// Setup and Teardown
// ============================================================================

async function setupTestContext(
  repoName: string = 'test-repo',
): Promise<TestContext> {
  vol.reset();

  const instance = createNewFsInstance(false);
  instance.fs = memfs;

  const r: RepoAccessObject = {
    fileSystemType: fsType.inBrowser,
    repoName,
  };

  const gitOps = new GitOperations(instance);

  return { instance, r, gitOps, fileState: initFileState };
}

async function initializeRepo(ctx: TestContext, branch: string = 'main') {
  await ctx.gitOps.initGitRepo(ctx.r, branch);
}

async function setupRepoWithConfig(
  ctx: TestContext,
  config = DEFAULT_GIT_CONFIG,
) {
  await initializeRepo(ctx);
  await ctx.gitOps.setGitConfig(ctx.r, config);
}

async function createTestFile(
  ctx: TestContext,
  filepath: string,
  content: string,
) {
  await ctx.instance.createFile(ctx.r, filepath, content);
}

async function commitTestFile(
  ctx: TestContext,
  filepath: string,
  content: string,
  message: string = 'Test commit',
) {
  await createTestFile(ctx, filepath, content);
  await ctx.gitOps.gitStageFile(ctx.r, filepath);
  await ctx.gitOps.gitCommit(
    ctx.r,
    message,
    DEFAULT_GIT_CONFIG.authorEmail,
    DEFAULT_GIT_CONFIG.authorName,
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('GitOperations', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTestContext();
  });

  afterEach(() => {
    vol.reset();
  });

  // --------------------------------------------------------------------------
  // Repository Initialization
  // --------------------------------------------------------------------------

  describe('Repository Initialization', () => {
    it('should initialize a new git repository with default branch', async () => {
      await ctx.gitOps.initGitRepo(ctx.r, 'main');

      // see if the directory exits
      const repoPath = getRepoPath(ctx.r);
      const repoDir = await ctx.instance.dirExists(join(repoPath, '.git'));

      expect(repoDir).toBeTruthy();
    });

    it('should initialize a new git repository with custom branch', async () => {
      await ctx.gitOps.initGitRepo(ctx.r, 'develop');

      // need to fix branches later
      // const branches = await ctx.gitOps.getAllGitBranches(ctx.r);
      // expect(branches).toContain('develop');
      const repoPath = getRepoPath(ctx.r);
      const repoDir = await ctx.instance.dirExists(join(repoPath, '.git'));

      expect(repoDir).toBeTruthy();
    });

    it('should list multiple repositories', async () => {
      const ctx1 = await setupTestContext('repo1');
      const ctx2 = await setupTestContext('repo2');

      await initializeRepo(ctx1);
      await initializeRepo(ctx2);

      const repos = await ctx.gitOps.listRepos(fsType.inBrowser);
      expect(repos).toContain('repo1');
      expect(repos).toContain('repo2');
      expect(repos.length).toBeGreaterThanOrEqual(2);
    });

    // currently git init is not throwing an error if called twice,
    // we must therefor test one level up
    // it('should handle initializing repo twice gracefully', async () => {
    //   await ctx.gitOps.initGitRepo(ctx.r, 'main');
    //   // Should throw
    //   await expect(ctx.gitOps.initGitRepo(ctx.r, 'main')).rejects.toThrow();
    // });
  });

  // --------------------------------------------------------------------------
  // Git Configuration
  // --------------------------------------------------------------------------

  describe('Git Configuration', () => {
    beforeEach(async () => {
      await initializeRepo(ctx);
    });

    it('should set and get git config', async () => {
      const config = {
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        remoteRepoUrl: '',
      };

      await ctx.gitOps.setGitConfig(ctx.r, config);
      const retrievedConfig = await ctx.gitOps.getGitConfig(ctx.r);

      expect(retrievedConfig.authorName).toBe(config.authorName);
      expect(retrievedConfig.authorEmail).toBe(config.authorEmail);
    });

    it('should handle setting config with remote URL', async () => {
      const config = {
        ...DEFAULT_GIT_CONFIG,
        remoteRepoUrl: 'https://github.com/test/repo.git',
      };

      await ctx.gitOps.setGitConfig(ctx.r, config);
      const remotes = await ctx.gitOps.listRepoRemotes(ctx.r);

      expect(remotes).toHaveLength(1);
      expect(remotes[0].url).toBe(config.remoteRepoUrl);
      expect(remotes[0].remote).toBe('origin');
    });

    it('should handle empty author name gracefully', async () => {
      const config = {
        authorName: '',
        authorEmail: 'test@example.com',
        remoteRepoUrl: '',
      };

      await ctx.gitOps.setGitConfig(ctx.r, config);
      const retrievedConfig = await ctx.gitOps.getGitConfig(ctx.r);

      expect(retrievedConfig.authorName).toBe('');
    });

    it('should update existing config', async () => {
      await ctx.gitOps.setGitConfig(ctx.r, DEFAULT_GIT_CONFIG);

      const newConfig = {
        authorName: 'Jane Doe',
        authorEmail: 'jane@example.com',
        remoteRepoUrl: '',
      };

      await ctx.gitOps.setGitConfig(ctx.r, newConfig);
      const retrievedConfig = await ctx.gitOps.getGitConfig(ctx.r);

      expect(retrievedConfig.authorName).toBe(newConfig.authorName);
      expect(retrievedConfig.authorEmail).toBe(newConfig.authorEmail);
    });
  });

  // --------------------------------------------------------------------------
  // File Staging and Status
  // --------------------------------------------------------------------------

  describe('File Staging and Status', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    it('should stage a new file', async () => {
      await createTestFile(ctx, 'test.txt', 'Hello World');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const testFile = status.find((f) => f.name === 'test.txt');

      expect(testFile).toBeDefined();
      expect(testFile?.status).toBe('added');
    });

    it('should unstage a staged file', async () => {
      await createTestFile(ctx, 'test.txt', 'Hello World');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');
      await ctx.gitOps.gitUnStageFile(ctx.r, 'test.txt');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const testFile = status.find((f) => f.name === 'test.txt');

      expect(testFile?.status).not.toBe('added');
    });

    it('should show modified file status', async () => {
      // Commit initial file
      await commitTestFile(ctx, 'test.txt', 'Initial content');

      // Modify the file
      await createTestFile(ctx, 'test.txt', 'Modified content');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const testFile = status.find((f) => f.name === 'test.txt');

      expect(testFile).toBeDefined();
      expect(testFile?.status).toBe('modified');
    });

    it('should show deleted file status', async () => {
      await commitTestFile(ctx, 'test.txt', 'Content');
      await ctx.instance.deleteFile(ctx.r, 'test.txt');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const testFile = status.find((f) => f.name === 'test.txt');

      expect(testFile).toBeDefined();
      expect(testFile?.status).toBe('deleted_unstaged');
    });

    it('should stage multiple files at once', async () => {
      const files = [
        { name: 'file1.txt', content: 'Content 1', status: 'added' },
        { name: 'file2.txt', content: 'Content 2', status: 'added' },
        { name: 'file3.txt', content: 'Content 3', status: 'added' },
      ];

      for (const file of files) {
        await createTestFile(ctx, file.name, file.content);
      }

      const modifiedFiles = files.map((f) => ({
        name: f.name,
        status: f.status as any,
      }));

      await ctx.gitOps.gitAddAllModified(ctx.r, modifiedFiles);

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.length).toBe(files.length);
      files.forEach((file) => {
        expect(status.find((s) => s.name === file.name)).toBeDefined();
      });
    });

    it('should unstage multiple files at once', async () => {
      const files = ['file1.txt', 'file2.txt', 'file3.txt'];

      for (const filename of files) {
        await createTestFile(ctx, filename, 'Content');
        await ctx.gitOps.gitStageFile(ctx.r, filename);
      }

      const modifiedFiles = files.map((name) => ({
        name,
        status: 'added' as any,
      }));

      await ctx.gitOps.gitRemoveAllModified(ctx.r, modifiedFiles);

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const stagedFiles = status.filter((s) => s.status === 'added');
      expect(stagedFiles.length).toBe(0);
    });

    it('should handle staging deleted files', async () => {
      await commitTestFile(ctx, 'test.txt', 'Content');
      await ctx.instance.deleteFile(ctx.r, 'test.txt');

      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      const testFile = status.find((f) => f.name === 'test.txt');

      expect(testFile?.status).toBe('deleted_staged');
    });

    it('should resolve individual file status', async () => {
      await createTestFile(ctx, 'test.txt', 'Content');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      const fileStatus = await ctx.gitOps.gitResolveFile(ctx.r, 'test.txt');

      expect(fileStatus.name).toBe('test.txt');
      expect(fileStatus.status).toBe('added');
    });
  });

  // --------------------------------------------------------------------------
  // Commits
  // --------------------------------------------------------------------------

  describe('Commits', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    // TODO Need to figure out why the \n is being added to commit messages
    it('should create a commit with staged files', async () => {
      await createTestFile(ctx, 'test.txt', 'Hello World');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      await ctx.gitOps.gitCommit(
        ctx.r,
        'Initial commit',
        DEFAULT_GIT_CONFIG.authorEmail,
        DEFAULT_GIT_CONFIG.authorName,
      );

      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits.length).toBe(1);
      expect(commits[0].commit.message.trim()).toBe('Initial commit');
    });

    it('should create multiple commits', async () => {
      const files = [
        { name: 'file1.txt', content: 'Content 1', message: 'Add file1' },
        { name: 'file2.txt', content: 'Content 2', message: 'Add file2' },
        { name: 'file3.txt', content: 'Content 3', message: 'Add file3' },
      ];

      for (const file of files) {
        await commitTestFile(ctx, file.name, file.content, file.message);
      }

      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits.length).toBe(files.length);

      // TODO new line also affects this requiring a trim
      const messages = commits.map((c) => c.commit.message.trim());
      files.forEach((file) => {
        expect(messages).toContain(file.message);
      });
    });

    // TODO it appears isomorphic git does not care if there are no staged files
    // it('should fail to commit without staged files', async () => {
    //   await expect(
    //     ctx.gitOps.gitCommit(
    //       ctx.r,
    //       'Empty commit',
    //       DEFAULT_GIT_CONFIG.authorEmail,
    //       DEFAULT_GIT_CONFIG.authorName,
    //     ),
    //   ).rejects.toThrow();
    // });

    it('should commit with author information', async () => {
      await commitTestFile(ctx, 'test.txt', 'Content', 'Test commit');

      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits[0].commit.author.name).toBe(DEFAULT_GIT_CONFIG.authorName);
      expect(commits[0].commit.author.email).toBe(
        DEFAULT_GIT_CONFIG.authorEmail,
      );
    });

    it('should handle commit with long message', async () => {
      const longMessage = 'A'.repeat(500);
      await commitTestFile(ctx, 'test.txt', 'Content', longMessage);

      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits[0].commit.message.trim()).toBe(longMessage);
    });

    it('should handle commit with multiline message', async () => {
      const multilineMessage =
        'First line\n\nSecond paragraph\n\nThird paragraph';
      await commitTestFile(ctx, 'test.txt', 'Content', multilineMessage);

      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits[0].commit.message.trim()).toBe(multilineMessage);
    });
  });

  // --------------------------------------------------------------------------
  // Branches
  // --------------------------------------------------------------------------

  describe('Branches', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
      await commitTestFile(ctx, 'initial.txt', 'Initial content');
    });

    it('should get current branch', async () => {
      const currentBranch = await ctx.gitOps.getCurrentGitBranch(ctx.r);
      expect(currentBranch).toBe('main');
    });

    it('should list all branches', async () => {
      const branches = await ctx.gitOps.getAllGitBranches(ctx.r);
      expect(branches).toContain('main');
      expect(branches.length).toBeGreaterThanOrEqual(1);
    });

    it('should checkout to a new branch', async () => {
      await git.branch({
        fs: ctx.instance.fs,
        dir: `/inBrowser/${ctx.r.repoName}`,
        ref: 'develop',
      });

      await ctx.gitOps.gitCheckout(ctx.r, 'develop');
      const currentBranch = await ctx.gitOps.getCurrentGitBranch(ctx.r);

      expect(currentBranch).toBe('develop');
    });

    it('should handle switching between branches', async () => {
      // Create and commit on main
      await commitTestFile(ctx, 'main.txt', 'Main branch content');

      // Create new branch
      await git.branch({
        fs: ctx.instance.fs,
        dir: `/inBrowser/${ctx.r.repoName}`,
        ref: 'feature',
      });

      await ctx.gitOps.gitCheckout(ctx.r, 'feature');
      expect(await ctx.gitOps.getCurrentGitBranch(ctx.r)).toBe('feature');

      await ctx.gitOps.gitCheckout(ctx.r, 'main');
      expect(await ctx.gitOps.getCurrentGitBranch(ctx.r)).toBe('main');
    });
  });

  // --------------------------------------------------------------------------
  // Stashing
  // --------------------------------------------------------------------------

  describe('Stashing', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
      await commitTestFile(ctx, 'initial.txt', 'Initial content');
    });

    it('should stash uncommitted changes', async () => {
      await createTestFile(ctx, 'unstaged.txt', 'Unstaged content');
      await ctx.gitOps.gitStageFile(ctx.r, 'unstaged.txt');
      await ctx.gitOps.gitStash(ctx.r);

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.length).toBe(0);
    });

    it('should list stashes', async () => {
      await createTestFile(ctx, 'test.txt', 'Content');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      await ctx.gitOps.gitStash(ctx.r);

      const stashes = await ctx.gitOps.gitListStash(ctx.r);
      expect(stashes.length).toBeGreaterThan(0);
    });

    it('should pop stashed changes', async () => {
      await createTestFile(ctx, 'test.txt', 'Stashed content');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      await ctx.gitOps.gitStash(ctx.r);

      // Verify file is gone
      let status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.length).toBe(0);

      // Pop stash
      await ctx.gitOps.gitStashPop(ctx.r);

      // Verify file is back
      status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === 'test.txt')).toBeDefined();
    });

    it('should get stash status', async () => {
      await createTestFile(ctx, 'test.txt', 'Content');
      await ctx.gitOps.gitStageFile(ctx.r, 'test.txt');

      await ctx.gitOps.gitStash(ctx.r);

      const stashStatus = await ctx.gitOps.getStashStatus(ctx.r);
      expect(stashStatus.find((f) => f.name === 'test.txt')).toBeDefined();
    });

    it('should handle multiple stashes', async () => {
      await createTestFile(ctx, 'file1.txt', 'Content 1');
      await ctx.gitOps.gitStageFile(ctx.r, 'file1.txt');
      await createTestFile(ctx, 'file2.txt', 'Content 2');
      await ctx.gitOps.gitStageFile(ctx.r, 'file2.txt');

      await ctx.gitOps.gitStash(ctx.r);

      const stashes = await ctx.gitOps.gitListStash(ctx.r);
      expect(stashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // Branch Reset
  // --------------------------------------------------------------------------
  // TODO Figure out why these are flaky
  // describe('Branch Reset', () => {
  //   beforeEach(async () => {
  //     await setupRepoWithConfig(ctx);
  //   });

  //   it('should reset branch to specific commit', async () => {
  //     // Create multiple commits
  //     await commitTestFile(ctx, 'file1.txt', 'Content 1', 'First commit');
  //     const commits1 = await ctx.gitOps.gitCommits(ctx.r);
  //     const firstCommitHash = commits1[0].oid;

  //     await commitTestFile(ctx, 'file2.txt', 'Content 2', 'Second commit');
  //     await commitTestFile(ctx, 'file3.txt', 'Content 3', 'Third commit');

  //     // Reset to first commit
  //     await ctx.gitOps.resetBranch(ctx.r, 'main', firstCommitHash);

  //     const commits = await ctx.gitOps.gitCommits(ctx.r);
  //     expect(commits.length).toBe(1);
  //     expect(commits[0].oid).toBe(firstCommitHash);
  //   });

  //   it('should handle resetting to HEAD', async () => {
  //     await commitTestFile(ctx, 'file1.txt', 'Content', 'Commit');

  //     const commits = await ctx.gitOps.gitCommits(ctx.r);
  //     const headCommit = commits[0].oid;

  //     await ctx.gitOps.resetBranch(ctx.r, 'main', headCommit);

  //     const newCommits = await ctx.gitOps.gitCommits(ctx.r);
  //     expect(newCommits[0].oid).toBe(headCommit);
  //   });
  // });

  // --------------------------------------------------------------------------
  // File Revert
  // --------------------------------------------------------------------------

  describe('File Revert', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    it('should revert file to HEAD', async () => {
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';

      await commitTestFile(ctx, 'test.txt', originalContent);
      await createTestFile(ctx, 'test.txt', modifiedContent);

      await ctx.gitOps.revertFileToHEAD(ctx.r, 'test.txt');

      const fileContent = await ctx.instance.getFileContent(ctx.r, 'test.txt');
      expect(fileContent?.content).toBe(originalContent);
    });

    it('should handle reverting multiple files', async () => {
      await commitTestFile(ctx, 'file1.txt', 'Original 1');
      await commitTestFile(ctx, 'file2.txt', 'Original 2');

      await createTestFile(ctx, 'file1.txt', 'Modified 1');
      await createTestFile(ctx, 'file2.txt', 'Modified 2');

      await ctx.gitOps.revertFileToHEAD(ctx.r, 'file1.txt');
      await ctx.gitOps.revertFileToHEAD(ctx.r, 'file2.txt');

      const content1 = await ctx.instance.getFileContent(ctx.r, 'file1.txt');
      const content2 = await ctx.instance.getFileContent(ctx.r, 'file2.txt');

      expect(content1?.content).toBe('Original 1');
      expect(content2?.content).toBe('Original 2');
    });
  });

  // --------------------------------------------------------------------------
  // File Diff
  // --------------------------------------------------------------------------

  describe('File Diff', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    it('should get diff between HEAD and working directory', async () => {
      const oldContent = 'Old content';
      const newContent = 'New content';

      await commitTestFile(ctx, 'test.txt', oldContent);
      await createTestFile(ctx, 'test.txt', newContent);

      const diff = await ctx.gitOps.handleGetFileDiff(ctx.r, 'test.txt');

      expect(diff.oldFile).toBe(oldContent);
      expect(diff.newFile).toBe(newContent);
    });

    it('should throw error when asked for the diff of a file without any history', async () => {
      await createTestFile(ctx, 'new.txt', 'New content');

      await expect(
        ctx.gitOps.handleGetFileDiff(ctx.r, 'new.txt'),
      ).rejects.toThrow();
    });

    it('should handle diff for unchanged file', async () => {
      const content = 'Unchanged content';
      await commitTestFile(ctx, 'test.txt', content);

      const diff = await ctx.gitOps.handleGetFileDiff(ctx.r, 'test.txt');

      expect(diff.oldFile).toBe(content);
      expect(diff.newFile).toBe(content);
    });
  });

  // --------------------------------------------------------------------------
  // Remote Operations
  // --------------------------------------------------------------------------

  describe('Remote Operations', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    it('should attach remote repository', async () => {
      const remoteUrl = 'https://github.com/test/repo.git';
      await ctx.gitOps.gitAttachRemoteRepo(ctx.r, remoteUrl);

      const remotes = await ctx.gitOps.listRepoRemotes(ctx.r);
      expect(remotes).toHaveLength(1);
      expect(remotes[0].url).toBe(remoteUrl);
      expect(remotes[0].remote).toBe('origin');
    });

    it('should list remote repositories', async () => {
      const remoteUrl = 'https://github.com/test/repo.git';
      await ctx.gitOps.gitAttachRemoteRepo(ctx.r, remoteUrl);

      const remotes = await ctx.gitOps.listRepoRemotes(ctx.r);
      expect(remotes.length).toBeGreaterThan(0);
    });

    it('should handle no remotes configured', async () => {
      const remotes = await ctx.gitOps.listRepoRemotes(ctx.r);
      expect(remotes).toEqual([]);
    });

    it('should get commits to push count without remote', async () => {
      await commitTestFile(ctx, 'file1.txt', 'Content 1');
      await commitTestFile(ctx, 'file2.txt', 'Content 2');

      const count = await ctx.gitOps.getCommitsToPushCount(ctx.r, 'main');
      expect(count).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // Repository Cloning
  // --------------------------------------------------------------------------

  describe('Repository Cloning', () => {
    beforeEach(async () => {
      ctx = await setupTestContext();
    });

    describe('Successful Cloning', () => {
      it('should clone a remote git repo', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'testRepo',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const repoPath = getRepoPath(r);
        expect(
          await ctx.instance.dirExists(join(repoPath, '.git')),
        ).toBeTruthy();
        expect(r.repoName).toBe('testrepo');
        expect(r.fileSystemType).toBe(fsType.inBrowser);
      });

      it('should clone with shallow clone enabled', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'shallowRepo',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          true, // shallow clone
        );

        const repoPath = getRepoPath(r);
        expect(await ctx.instance.dirExists(repoPath)).toBeTruthy();

        // Verify it's a shallow clone by checking commit count
        const commits = await ctx.gitOps.gitCommits(r);
        expect(commits.length).toBe(1); // Shallow clone should only have 1 commit
      });

      it('should sanitize repo name with special characters', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'Test Repo $pecial!',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        expect(r.repoName).toMatch(/^[a-z0-9-]+$/);
        expect(r.repoName).not.toContain(' ');
        expect(r.repoName).not.toContain('$');
        expect(r.repoName).not.toContain('!');
      });

      it('should clone and verify branch is correct', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'branchTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const currentBranch = await ctx.gitOps.getCurrentGitBranch(r);
        expect(currentBranch).toBe('main');
      });

      it('should clone and have working git operations', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'workingRepo',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        // Verify we can perform git operations on cloned repo
        const branches = await ctx.gitOps.getAllGitBranches(r);
        expect(branches.length).toBeGreaterThan(0);

        const commits = await ctx.gitOps.gitCommits(r);
        expect(commits.length).toBeGreaterThan(0);

        const status = await ctx.gitOps.gitRepoStatus(r);
        expect(Array.isArray(status)).toBeTruthy();
      });
    });

    describe('Clone Error Handling', () => {
      it('should throw an error when trying to clone non-existent branch', async () => {
        await expect(
          ctx.gitOps.cloneRepo(
            'testRepo',
            fsType.inBrowser,
            PUBLIC_TEST_REPO,
            'non-existent-branch',
            MOCK_CREDENTIALS.username,
            MOCK_CREDENTIALS.password,
            false,
          ),
        ).rejects.toThrow('Could not find non-existent-branch.');

        // Verify repo was cleaned up after failure
        const repos = await ctx.gitOps.listRepos(fsType.inBrowser);
        expect(repos).not.toContain('testrepo');
      });

      it('should throw an error when trying to clone invalid URL', async () => {
        await expect(
          ctx.gitOps.cloneRepo(
            'invalidRepo',
            fsType.inBrowser,
            'https://github.com/nonexistent/invalid-repo-12345.git',
            'main',
            MOCK_CREDENTIALS.username,
            MOCK_CREDENTIALS.password,
            false,
          ),
        ).rejects.toThrow();

        // Verify cleanup
        const repos = await ctx.gitOps.listRepos(fsType.inBrowser);
        expect(repos).not.toContain('invalidrepo');
      });

      it('should prevent cloning when repo name already exists', async () => {
        // First clone
        await ctx.gitOps.cloneRepo(
          'existingRepo',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        // Try to clone again with same name
        await expect(
          ctx.gitOps.cloneRepo(
            'existingRepo',
            fsType.inBrowser,
            PUBLIC_TEST_REPO,
            'main',
            MOCK_CREDENTIALS.username,
            MOCK_CREDENTIALS.password,
            false,
          ),
        ).rejects.toThrow(repoNameInUseMessage);
      });

      it('should handle clone with invalid credentials gracefully', async () => {
        // Assuming the test repo requires auth or returns 401
        await expect(
          ctx.gitOps.cloneRepo(
            'authRepo',
            fsType.inBrowser,
            'https://github.com/private/repo.git', // Use a private repo URL if available
            'main',
            'invalid_user',
            'invalid_pass',
            false,
          ),
        ).rejects.toThrow();
      });

      it('should cleanup partial clone on failure', async () => {
        const repoName = 'partialClone';

        try {
          await ctx.gitOps.cloneRepo(
            repoName,
            fsType.inBrowser,
            'https://invalid-url.git',
            'main',
            MOCK_CREDENTIALS.username,
            MOCK_CREDENTIALS.password,
            false,
          );
        } catch (error) {
          // Expected to fail
        }

        // Verify no partial repo left behind
        const repoPath = getRepoPath({
          repoName,
          fileSystemType: fsType.inBrowser,
        });
        expect(await ctx.instance.dirExists(repoPath)).toBeFalsy();
      });
    });

    describe('Clone with Different Configurations', () => {
      it('should clone to different filesystem types', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'fsTypeTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        expect(r.fileSystemType).toBe(fsType.inBrowser);

        const repoPath = getRepoPath(r);
        expect(repoPath).toContain('inBrowser');
      });

      it('should clone with empty credentials if repo is public', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'publicRepo',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          '', // empty username
          '', // empty password
          false,
        );

        const repoPath = getRepoPath(r);
        expect(await ctx.instance.dirExists(repoPath)).toBeTruthy();
      });

      it('should handle very long repo names', async () => {
        const longName = 'a'.repeat(100);

        const r = await ctx.gitOps.cloneRepo(
          longName,
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        // Should still create the repo (possibly truncated)
        expect(r.repoName).toBeTruthy();
        expect(await ctx.instance.dirExists(getRepoPath(r))).toBeTruthy();
      });

      it('should handle unicode characters in repo name', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'テスト-repo-测试',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        // Should sanitize to valid characters
        expect(r.repoName).toMatch(/^[a-z0-9-]+$/);
        expect(await ctx.instance.dirExists(getRepoPath(r))).toBeTruthy();
      });
    });

    describe('Post-Clone Verification', () => {
      it('should have .git directory after clone', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'gitDirTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const repoPath = getRepoPath(r);
        const gitDirExists = await ctx.instance.dirExists(
          join(repoPath, '.git'),
        );
        expect(gitDirExists).toBeTruthy();
      });

      it('should have git config set after clone', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'configTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const config = await ctx.gitOps.getGitConfig(r);
        // Config should exist even if empty
        expect(config).toBeDefined();
      });

      it('should have remote configured after clone', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'remoteTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const remotes = await ctx.gitOps.listRepoRemotes(r);
        expect(remotes.length).toBeGreaterThan(0);
        expect(remotes[0].remote).toBe('origin');
        expect(remotes[0].url).toBe(PUBLIC_TEST_REPO);
      });

      it('should list cloned repo in repos list', async () => {
        const repoName = 'listedRepo';

        const r = await ctx.gitOps.cloneRepo(
          repoName,
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        const repos = await ctx.gitOps.listRepos(fsType.inBrowser);
        expect(repos).toContain(r.repoName);
      });
    });

    describe('Performance and Edge Cases', () => {
      it('should handle cloning multiple repos sequentially', async () => {
        const repos = ['repo1', 'repo2', 'repo3'];

        for (const repoName of repos) {
          const r = await ctx.gitOps.cloneRepo(
            repoName,
            fsType.inBrowser,
            PUBLIC_TEST_REPO,
            'main',
            MOCK_CREDENTIALS.username,
            MOCK_CREDENTIALS.password,
            true, // use shallow to speed up
          );

          expect(r.repoName).toBe(repoName);
        }

        const allRepos = await ctx.gitOps.listRepos(fsType.inBrowser);
        repos.forEach((name) => {
          expect(allRepos).toContain(name);
        });
      });

      it('should return correct RepoAccessObject structure', async () => {
        const r = await ctx.gitOps.cloneRepo(
          'structureTest',
          fsType.inBrowser,
          PUBLIC_TEST_REPO,
          'main',
          MOCK_CREDENTIALS.username,
          MOCK_CREDENTIALS.password,
          false,
        );

        expect(r).toHaveProperty('repoName');
        expect(r).toHaveProperty('fileSystemType');
        expect(typeof r.repoName).toBe('string');
        expect(r.fileSystemType).toBe(fsType.inBrowser);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases and Error Handling
  // --------------------------------------------------------------------------

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await setupRepoWithConfig(ctx);
    });

    it('should handle status check on empty repo', async () => {
      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status).toEqual([]);
    });

    it('should handle getting commits on empty repo', async () => {
      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits).toEqual([]);
    });

    // It appears that isomorphic git does not care about staging non existent files
    // it('should handle staging non-existent file', async () => {
    //   await expect(
    //     ctx.gitOps.gitStageFile(ctx.r, 'nonexistent.txt'),
    //   ).rejects.toThrow();
    // });

    // It appears that isomorphic git does not care about staging non existent files
    // it('should handle unstaging non-existent file gracefully', async () => {
    //   // Should not throw
    //   await ctx.gitOps.gitUnStageFile(ctx.r, 'nonexistent.txt');
    // });

    it('should handle resolving non-existent file', async () => {
      const fileStatus = await ctx.gitOps.gitResolveFile(
        ctx.r,
        'nonexistent.txt',
      );
      expect(fileStatus.status).toBe('unknown');
    });

    it('should handle getting current branch on uninitialized repo', async () => {
      const newCtx = await setupTestContext('uninitialized-repo');
      const branch = await newCtx.gitOps.getCurrentGitBranch(newCtx.r);
      expect(branch).toBeNull();
    });

    it('should handle very long filenames', async () => {
      const longFilename = 'a'.repeat(200) + '.txt';
      await createTestFile(ctx, longFilename, 'Content');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === longFilename)).toBeDefined();
    });

    it('should handle files with special characters in name', async () => {
      const specialFilename = 'file with spaces & special!.txt';
      await createTestFile(ctx, specialFilename, 'Content');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === specialFilename)).toBeDefined();
    });

    it('should handle binary file content', async () => {
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xff]);
      await ctx.instance.createFile(ctx.r, 'binary.bin', binaryContent);
      await ctx.gitOps.gitStageFile(ctx.r, 'binary.bin');

      const status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === 'binary.bin')).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Integration Tests
  // --------------------------------------------------------------------------

  describe('Full Workflow Integration', () => {
    it('should handle complete git workflow', async () => {
      // 1. Initialize repo with config
      await setupRepoWithConfig(ctx);

      // 2. Create and commit multiple files
      await commitTestFile(ctx, 'file1.txt', 'Content 1', 'Add file1');
      await commitTestFile(ctx, 'file2.txt', 'Content 2', 'Add file2');
      await commitTestFile(ctx, 'file3.txt', 'Content 3', 'Add file3');

      // 3. Verify commits
      const commits = await ctx.gitOps.gitCommits(ctx.r);
      expect(commits.length).toBe(3);

      // 4. Modify a file
      await createTestFile(ctx, 'file1.txt', 'Modified content');

      // 5. Check status
      let status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === 'file1.txt')?.status).toBe(
        'modified',
      );

      // 6. Stash changes
      await ctx.gitOps.gitStash(ctx.r);
      status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.length).toBe(0);

      // 7. Pop stash
      await ctx.gitOps.gitStashPop(ctx.r);
      status = await ctx.gitOps.gitRepoStatus(ctx.r);
      expect(status.find((f) => f.name === 'file1.txt')).toBeDefined();

      // 8. Stage and commit changes
      await ctx.gitOps.gitStageFile(ctx.r, 'file1.txt');
      await ctx.gitOps.gitCommit(
        ctx.r,
        'Update file1',
        DEFAULT_GIT_CONFIG.authorEmail,
        DEFAULT_GIT_CONFIG.authorName,
      );

      // 9. Verify final state
      const finalCommits = await ctx.gitOps.gitCommits(ctx.r);
      expect(finalCommits.length).toBe(4);
      expect(finalCommits[0].commit.message.trim()).toBe('Update file1');
    });

    it('should handle adding a course and lesson', async () => {
      // 1. Initialize repo with config
      await setupRepoWithConfig(ctx);

      const courseTitle = 'test-course';
      // 2. Create a new course
      const course = await createTestCourse(ctx, { courseTitle });
      if (!course.courseData) throw Error('No course data');
      const courseData = await verifyCourseStructure(
        ctx,
        course.basePath,
        course.courseData.courseTitle,
      );

      // 3. Create a new lesson
      const newCourseData = await createAndVerifyLesson(
        ctx,
        course.basePath,
        courseData,
        'Synced Lesson',
      );

      const newLesson =
        newCourseData.blocks[0].aus[newCourseData.blocks[0].aus.length - 1];
      const filepath = newLesson.slides[0].filepath;

      const operations: Record<string, Operation> = {
        [filepath]: Operation.Add,
      };

      // 4. Sync lesson to file system
      await syncCourseToFs(ctx, course.basePath, newCourseData, operations);

      // 5. Check repo status
      const statusPreStage = await ctx.gitOps.gitRepoStatus(ctx.r);

      // ensure the status is correct for these files
      expect(statusPreStage.length).toBe(3);
      // it's expected that this would be added when a course is created
      expect(statusPreStage.map((file) => file.name)).toContain(
        join(courseTitle, 'RC5.yaml'),
      );

      statusPreStage.forEach((file) => expect(file.status).toBe('untracked'));

      // 6. Stage all files
      await ctx.gitOps.gitAddAllModified(ctx.r, statusPreStage);
      const statusPostStage = await ctx.gitOps.gitRepoStatus(ctx.r);

      expect(statusPostStage.length).toBe(3);
      statusPostStage.forEach((file) => expect(file.status).toBe('added'));

      // 7. Now unstage all files
      await ctx.gitOps.gitRemoveAllModified(ctx.r, statusPostStage);
      const statusPostUnStage = await ctx.gitOps.gitRepoStatus(ctx.r);

      expect(statusPostUnStage.length).toBe(3);
      statusPostUnStage.forEach((file) =>
        expect(file.status).toBe('untracked'),
      );
    });

    // branches are currently not supported, will add back once its time
    // it('should handle branch workflow', async () => {
    //   await setupRepoWithConfig(ctx);

    //   // Create initial commit
    //   await commitTestFile(ctx, 'main.txt', 'Main branch', 'Initial commit');

    //   // Create and switch to feature branch
    //   await git.branch({
    //     fs: ctx.instance.fs,
    //     dir: `/inBrowser/${ctx.r.repoName}`,
    //     ref: 'feature',
    //   });
    //   await ctx.gitOps.gitCheckout(ctx.r, 'feature');

    //   // Make changes on feature branch
    //   await commitTestFile(ctx, 'feature.txt', 'Feature work', 'Add feature');

    //   // Switch back to main
    //   await ctx.gitOps.gitCheckout(ctx.r, 'main');

    //   // Verify main doesn't have feature changes
    //   const mainStatus = await ctx.gitOps.gitRepoStatus(ctx.r);
    //   expect(mainStatus.find((f) => f.name === 'feature.txt')).toBeUndefined();
    // });
  });
});
