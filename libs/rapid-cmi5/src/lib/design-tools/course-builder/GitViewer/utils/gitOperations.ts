import { FileStatus, getFileStatus, mapGitStatus } from './StatusMatrix';
import { gitCache, GitFS } from './fileSystem';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { GitConfigType } from '../../CourseBuilderApiTypes';
import { debugLog, debugLogError } from '@rangeos-nx/ui/branded';
import path, { join } from 'path-browserify';
import { fsType, RepoAccessObject } from '../../../../redux/repoManagerReducer';

const AuthenticationErrorMessage =
  'The credentials provided are invalid; authentication has failed.';
const AuthorizationErrorMessage =
  'The credentials provided are invalid; authentication has failed.';

export const failedMergePath = '.git/failedMerge.txt';

export const getRepoPath = (r: RepoAccessObject) =>
  path.posix.join('/', r.fileSystemType, r.repoName);

export class GitOperations {
  private gitFs: GitFS;

  constructor(gitFs: GitFS) {
    this.gitFs = gitFs;
  }

  listRepos = async (fileSystem: fsType): Promise<string[]> => {
    try {
      const raw = await this.gitFs.fs.promises.readdir(
        '/' + fileSystem.toString(),
      );
      const repos = raw.map((repo) => repo.toString());
      return repos;
    } catch (error: any) {
      debugLogError(`Could not list repos ${error}`);
      return [];
    }
  };

  cloneRepo = async (
    r: RepoAccessObject,
    repoRemoteUrl: string,
    branch: string,
    username: string,
    password: string,
    shallowClone: boolean,
  ): Promise<void> => {
    const dir = getRepoPath(r);

    if (this.gitFs.isElectron) {
      await window.fsApi.cloneRepo(
        dir,
        repoRemoteUrl,
        branch,
        shallowClone,
        username,
        password,
      );
    } else {
      await git.clone({
        fs: this.gitFs.fs,
        http,
        dir,
        url: repoRemoteUrl,
        ref: branch,
        depth: shallowClone ? 1 : undefined,
        singleBranch: true,
        onAuth: () => ({ username, password }),
      });
      await this.gitFs.copyGit(r);
    }
  };
  initGitRepo = async (
    r: RepoAccessObject,
    defaultBranch: string = 'main',
  ): Promise<void> => {
    const dir = getRepoPath(r);

    try {
      if (this.gitFs?.isElectron) {
        await window.fsApi.gitInitRepo(dir, defaultBranch);
      } else {
        await git.init({ fs: this.gitFs.fs, dir, defaultBranch });
        await this.gitFs.copyGit(r);
      }
    } catch (error: any) {
      debugLogError(
        `Git init failed for file system: ${r.fileSystemType}, repo: ${r.repoName}`,
      );
      throw error;
    }
  };

  listRepoRemotes = async (
    r: RepoAccessObject,
  ): Promise<{ remote: string; url: string }[]> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        return await window.fsApi.listRepoRemotes(dir);
      } else {
        return await git.listRemotes({ fs: this.gitFs.fs, dir });
      }
    } catch (error: any) {
      debugLogError(`Could not list remote repos ${error}`);
      return [];
    }
  };

  gitAttachRemoteRepo = async (
    r: RepoAccessObject,
    remoteUrl: string,
  ): Promise<void> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        window.fsApi.gitAddRemote(dir, remoteUrl);
      } else {
        await git.addRemote({
          fs: this.gitFs.fs,
          dir,
          gitdir: gitCache,
          remote: 'origin',
          url: remoteUrl,
        });

        await git.addRemote({
          fs: this.gitFs.fs,
          dir,
          remote: 'origin',
          url: remoteUrl,
        });
      }
    } catch (error: any) {
      throw new Error(
        `Git add remote failed for filesystem: ${r.fileSystemType}, repo: ${r.repoName} to remote ${remoteUrl}, ${error}`,
      );
    }
  };

  gitCommits = async (r: RepoAccessObject): Promise<git.ReadCommitResult[]> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        return await window.fsApi.gitLog(dir);
      } else {
        return await git.log({
          fs: this.gitFs.fs,
          dir,
          gitdir: this.gitFs.isElectron ? undefined : gitCache,
        });
      }
    } catch (error: any) {
      debugLogError(error);
      return [];
    }
  };

  gitAttemptConflictedMerge = async (
    r: RepoAccessObject,
    branch: string,
    username: string,
    password: string,
  ): Promise<void> => {
    const dir = getRepoPath(r);
    try {
      await git.fetch({
        fs: this.gitFs.fs,
        http,
        dir,
        ref: branch,
        singleBranch: true,
        onAuth: () => ({ username, password }),
      });

      await git.merge({
        fs: this.gitFs.fs,
        ours: branch,
        dir,
        theirs: '/remotes/origin/' + branch,
        abortOnConflict: false,
      });
    } catch (error: any) {
      await this.gitFs.createFile(r, failedMergePath, error?.message);

      error.message = [
        error?.message || 'Merge has failed.',
        'The merge conflicts will be displayed in the file status tab.',
        'Please manually fix the files by clicking the red merge conflict button.',
        'Once complete, click the "Merge Changes" button to finalize the merge.',
      ].join('\n');

      throw error;
    }
  };

  completeMerge = async (
    r: RepoAccessObject,
    authorName: string,
    authorEmail: string,
    branch: string,
  ) => {
    const dir = getRepoPath(r);
    try {
      await git.commit({
        fs: this.gitFs.fs,
        dir,
        author: { name: authorName, email: authorEmail },
        message: `Merge '${branch}' into origin ${branch}`,
        parent: [branch, '/remotes/origin/' + branch],
      });

      await this.gitFs.deleteFile(r, failedMergePath);
    } catch (error: any) {
      throw error;
    }
  };

  gitPull = async (
    r: RepoAccessObject,
    branch: string,
    username: string,
    password: string,
    attemptMerge: boolean,
  ): Promise<void> => {
    const dir = getRepoPath(r);

    try {
      if (this.gitFs.isElectron) {
        await window.fsApi.pullRepo(dir, branch, username, password);
      } else {
        await git.pull({
          fs: this.gitFs.fs,
          http,
          dir,
          ref: branch,
          singleBranch: true,
          fastForward: false,
          onAuth: () => ({ username, password }),
        });

        await this.gitFs.copyGit(r);
      }
    } catch (error: any) {
      if (
        error.name === 'MergeConflictError' ||
        error.name === 'MergeNotSupportedError'
      ) {
        if (attemptMerge) {
          await this.gitAttemptConflictedMerge(r, branch, username, password);
        } else {
          throw Error(
            'The repository could not be pulled due to merge conflicts. Please check the box to attempt to merge with conflicts.',
          );
        }
      }
      if (error?.data?.statusCode === 404) {
        throw Error(
          error.data?.response ||
            'The repository could not be found or you do not have permission to view it',
        );
      }
      if (error?.data?.statusCode === 401) {
        throw Error(AuthenticationErrorMessage);
      }

      if (error?.data?.statusCode === 403) {
        throw Error(AuthorizationErrorMessage);
      }
      throw error;
    }
  };
  gitRepoStatus = async (
    r: RepoAccessObject,
    changedFiles?: string[],
  ): Promise<{ name: string; status: FileStatus }[]> => {
    const dir = getRepoPath(r);

    try {
      let status;

      if (this.gitFs.isElectron) {
        status = await window.fsApi.getStatus(dir);
      } else {
        status = await git.statusMatrix({
          fs: this.gitFs.fs,
          dir,
          gitdir: this.gitFs.isElectron ? undefined : gitCache,
          filepaths: changedFiles,
        });
      }

      if (status === undefined) return [];

      return status
        .map(([file, HEAD, WORKDIR, STAGE]) => ({
          name: file,
          status: getFileStatus(HEAD, WORKDIR, STAGE),
        }))
        .filter(
          (file) => file.status !== 'unmodified' && file.status !== 'unknown',
        );
    } catch (error: any) {
      return [];
    }
  };

  getStashStatus = async (r: RepoAccessObject): Promise<ModifiedFile[]> => {
    try {
      const dir = getRepoPath(r);

      if (this.gitFs.isElectron) {
        return await window.fsApi.getStashStatus(dir);
      } else {
        const raw = await git.walk({
          fs: this.gitFs.fs,
          dir,
          gitdir: this.gitFs.isElectron ? undefined : gitCache,
          trees: [git.TREE({ ref: 'HEAD' }), git.TREE({ ref: 'refs/stash' })],

          map: async (filepath, [left, right]) => {
            if (filepath === '.') return undefined;

            const [lt, rt] = await Promise.all([
              left?.type?.(),
              right?.type?.(),
            ]);

            const isBlobLeft = lt === 'blob';
            const isBlobRight = rt === 'blob';
            if (!isBlobLeft && !isBlobRight) return undefined;

            const [lOid, rOid] = await Promise.all([
              left?.oid?.(),
              right?.oid?.(),
            ]);

            if (!left && right)
              return { path: filepath, change: 'added' as const };
            if (left && !right)
              return { path: filepath, change: 'deleted_staged' as const };
            if (left && right && lOid !== rOid) {
              return { path: filepath, change: 'modified' as const };
            }
            return undefined;
          },
        });

        return raw.map((file: any) => ({
          name: file.path,
          status: file.change,
        }));
      }
    } catch (error: any) {
      return [];
    }
  };

  gitResolveFile = async (
    r: RepoAccessObject,
    filepath: string,
  ): Promise<ModifiedFile> => {
    const dir = getRepoPath(r);
    try {
      let status;
      if (this.gitFs.isElectron) {
        status = await window.fsApi.gitResolveFile(dir, filepath);
      } else {
        status = await git.status({
          fs: this.gitFs.fs,
          dir,
          filepath,
          gitdir: this.gitFs.isElectron ? undefined : gitCache,
        });
      }

      const res: ModifiedFile = {
        name: filepath,
        status: mapGitStatus(status),
      };
      return res;
    } catch (error: any) {
      debugLogError(error);
      return {
        name: filepath,
        status: 'unmodified',
      };
    }
  };

  gitAddAllModified = async (
    r: RepoAccessObject,
    files: ModifiedFile[],
  ): Promise<ModifiedFile[]> => {
    const dir = getRepoPath(r);

    for (const file of files) {
      try {
        if (file.status === 'deleted_unstaged') {
          if (this.gitFs.isElectron) {
            await window.fsApi.gitRemove(dir, file.name);
          } else {
            await git.remove({
              fs: this.gitFs.fs,
              dir,
              gitdir: gitCache,
              filepath: file.name,
            });

            git.remove({ fs: this.gitFs.fs, dir, filepath: file.name });
          }
        } else if (file.status !== 'deleted_staged') {
          if (this.gitFs.isElectron) {
            await window.fsApi.gitAdd(dir, file.name);
          } else {
            await git.add({
              fs: this.gitFs.fs,
              dir,
              filepath: file.name,
              gitdir: gitCache,
            });

            await git.add({
              fs: this.gitFs.fs,
              dir,
              filepath: file.name,
            });
          }
        }
      } catch (error: any) {
        debugLogError(`Error staging file ${file.name}, ${error}`);
      }
    }
    return await this.gitRepoStatus(
      r,
      files.map((f) => f.name),
    );
  };

  gitRemoveAllModified = async (
    r: RepoAccessObject,
    files: ModifiedFile[],
  ): Promise<ModifiedFile[]> => {
    const dir = getRepoPath(r);
    const cache = {};
    for (const file of files) {
      try {
        if (this.gitFs.isElectron) {
          await window.fsApi.gitResetIndex(dir, file.name);
        } else {
          await git.resetIndex({
            fs: this.gitFs.fs,
            gitdir: gitCache,
            dir,
            cache,
            filepath: file.name,
          });

          await git.resetIndex({
            fs: this.gitFs.fs,
            dir,
            filepath: file.name,
          });
        }

        // const resolvedFile = await gitResolveFile(r, file.name);
        // file.status = resolvedFile.status;
      } catch (error: any) {
        debugLogError(`Error removing staged file ${file.name}, ${error}`);
      }
    }

    return await this.gitRepoStatus(
      r,
      files.map((f) => f.name),
    );
  };

  setGitConfig = async (
    r: RepoAccessObject,
    req: GitConfigType,
  ): Promise<void> => {
    try {
      const dir = getRepoPath(r);

      if (this.gitFs.isElectron) {
        await window.fsApi.setGitConfig(dir, 'user.name', req.authorName);
        await window.fsApi.setGitConfig(dir, 'user.email', req.authorEmail);
      } else {
        await git.setConfig({
          fs: this.gitFs.fs,
          dir,
          gitdir: gitCache,
          path: 'user.name',
          value: req.authorName,
        });

        await git.setConfig({
          fs: this.gitFs.fs,
          dir,
          gitdir: gitCache,
          path: 'user.email',
          value: req.authorEmail,
        });

        await git.setConfig({
          fs: this.gitFs.fs,
          dir,
          path: 'user.name',
          value: req.authorName,
        });

        await git.setConfig({
          fs: this.gitFs.fs,
          dir,
          path: 'user.email',
          value: req.authorEmail,
        });
      }

      if (req.remoteRepoUrl !== '') {
        await this.gitAttachRemoteRepo(r, req.remoteRepoUrl);
      }
    } catch (error: any) {
      debugLogError(`Error setting config ${error}`);
    }
  };

  getGitConfig = async (r: RepoAccessObject): Promise<GitConfigType> => {
    const dir = getRepoPath(r);
    let authorName;
    let authorEmail;
    let remoteRepoUrls;

    if (this.gitFs.isElectron) {
      authorName = await window.fsApi.getGitConfig(dir, 'user.name');
      authorEmail = await window.fsApi.getGitConfig(dir, 'user.email');
      remoteRepoUrls = await window.fsApi.listRepoRemotes(dir);
    } else {
      authorName = await git.getConfig({
        fs: this.gitFs.fs,
        dir,
        path: 'user.name',
      });
      authorEmail = await git.getConfig({
        fs: this.gitFs.fs,
        dir,
        path: 'user.email',
      });
      remoteRepoUrls = await this.listRepoRemotes(r);
    }

    return {
      authorName,
      authorEmail,
      remoteRepoUrl: remoteRepoUrls[0]?.url || '',
    };
  };

  gitStash = async (r: RepoAccessObject): Promise<void> => {
    const dir = getRepoPath(r);

    if (this.gitFs.isElectron) {
      await window.fsApi.gitStash(dir, 'push');
    } else {
      await git.stash({
        fs: this.gitFs.fs,
        dir,
        message: 'Stash changes',
      });

      await this.gitFs.copyGit(r);
    }
  };

  gitListStash = async (r: RepoAccessObject) => {
    const dir = getRepoPath(r);
    let stash;
    if (this.gitFs.isElectron) {
      stash = await window.fsApi.gitStash(dir, 'list');
    } else {
      stash = await git.stash({
        fs: this.gitFs.fs,
        dir,
        gitdir: this.gitFs.isElectron ? undefined : gitCache,
        op: 'list',
      });
    }

    return stash as unknown as string[];
  };

  gitStashPop = async (r: RepoAccessObject): Promise<ModifiedFile[]> => {
    try {
      // there is a bug that requires this due to not being able to delete repos
      const stashFiles = await this.getStashStatus(r);
      const dir = getRepoPath(r);
      for (const file of stashFiles) {
        if (file.status === 'deleted_staged') {
          await this.gitFs.fs.promises.unlink(`/${dir}/${file.name}`);
        }
      }

      if (this.gitFs.isElectron) {
        await window.fsApi.gitStash(dir, 'pop');
      } else {
        await git.stash({ fs: this.gitFs.fs, dir, op: 'pop' });
        await this.gitFs.copyGit(r);
      }

      return await this.gitRepoStatus(
        r,
        stashFiles.map((f) => f.name),
      );
    } catch (error: any) {
      throw Error(error);
    }
  };

  gitStashDelete = async (r: RepoAccessObject): Promise<void> => {
    const dir = getRepoPath(r);
    await git.stash({ fs: this.gitFs.fs, dir, op: 'drop' });
    await this.gitFs.copyGit(r);
  };

  gitCommit = async (
    r: RepoAccessObject,
    message: string,
    committerEmail: string,
    committerName: string,
  ): Promise<void> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        await window.fsApi.gitCommit(
          dir,
          message,
          committerName,
          committerEmail,
        );
      } else {
        await git.commit({
          fs: this.gitFs.fs,
          dir,
          gitdir: gitCache,
          message,
          author: { name: committerName, email: committerEmail },
        });

        await git.commit({
          fs: this.gitFs.fs,
          dir,
          message,
          author: { name: committerName, email: committerEmail },
        });
      }
    } catch (error: any) {
      debugLog('Could not create commit');
      throw error;
    }
  };

  gitPush = async (
    r: RepoAccessObject,
    username: string,
    password: string,
  ): Promise<void> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        await window.fsApi.pushRepo(dir, username, password);
      } else {
        await git.push({
          fs: this.gitFs.fs,
          http,
          dir,
          onAuth: () => ({ username, password }),
        });
      }
    } catch (error: any) {
      if (error?.code === 'NotFoundError') {
        throw Error(
          'No branch was found to push. Please ensure your course has a branch to be pushed to the remote.',
        );
      }
      if (error?.data?.reason === 'not-fast-forward') {
        throw Error(
          'Push failed because it was not a simple fast forward. Additional commits exist on the remote; please pull and try again.',
        );
      }

      if (error?.message === 'Failed to fetch') {
        throw Error(
          'Push failed because it could not reach the remote URL. Please check that your network connection is stable and that the remote URL is correct.',
        );
      }

      if (error?.data?.statusCode === 401) {
        throw Error(AuthenticationErrorMessage);
      }

      if (error?.data?.statusCode === 403) {
        throw Error(AuthorizationErrorMessage);
      }

      throw error;
    }
  };
  gitCheckout = async (r: RepoAccessObject, branch: string) => {
    const dir = getRepoPath(r);
    if (this.gitFs.isElectron) {
      window.fsApi.gitCheckout(dir, branch);
    } else {
      await git.checkout({
        fs: this.gitFs.fs,
        dir,
        ref: branch,
      });
    }
  };
  getCurrentGitBranch = async (
    r: RepoAccessObject,
  ): Promise<string | void | null> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        return await window.fsApi.getCurrentBranch(dir);
      } else {
        return await git.currentBranch({
          fs: this.gitFs.fs,
          dir,
        });
      }
    } catch (error: any) {
      //TODO UI handle error
      debugLogError(error);
      return null;
    }
  };

  getAllGitBranches = async (r: RepoAccessObject): Promise<string[]> => {
    const dir = getRepoPath(r);
    try {
      if (this.gitFs.isElectron) {
        return window.fsApi.getAllGitBranches(dir);
      } else {
        return await git.listBranches({ fs: this.gitFs.fs, dir });
      }
    } catch {
      return [];
    }
  };

  // Compares the number of commits for the ref tracking origin branch compared to the ref tracking the local branch
  async getCommitsToPushCount(r: RepoAccessObject, branch: string) {
    const dir = getRepoPath(r);

    let remoteRef;
    try {
      if (this.gitFs.isElectron) {
        remoteRef = await window.fsApi.gitResolveRef(dir, branch);
      } else {
        remoteRef = await git.resolveRef({
          fs: this.gitFs.fs,
          dir,
          gitdir: this.gitFs.isElectron ? undefined : gitCache,
          ref: `refs/remotes/origin/${branch}`,
        });
      }
    } catch (err) {
      if (this.gitFs.isElectron) {
        return await window.fsApi.gitLog(dir).then((log) => log.length);
      } else {
        return await git
          .log({
            fs: this.gitFs.fs,
            dir,
            gitdir: this.gitFs.isElectron ? undefined : gitCache,
            ref: branch,
          })
          .then((log) => log.length);
      }
    }

    let localCommits;
    if (this.gitFs.isElectron) {
      localCommits = await window.fsApi.gitLog(dir);
    } else {
      localCommits = await git.log({
        fs: this.gitFs.fs,
        dir,
        gitdir: this.gitFs.isElectron ? undefined : gitCache,
        ref: 'HEAD',
      });
    }

    let count = 0;
    for (const commit of localCommits) {
      if (commit.oid === remoteRef) break;
      count++;
    }

    return count;
  }

  async gitStageFile(r: RepoAccessObject, filepath: string) {
    const dir = getRepoPath(r);

    const absPath = join(dir, filepath);
    try {
      let stat;
      try {
        stat = await this.gitFs.fs.promises.stat(absPath);
      } catch (error: any) {
        debugLogError('Could not state file during staging');
        if (error.code != 'ENOENT') throw error;
      }
      if (stat) {
        if (this.gitFs.isElectron) {
          await window.fsApi.gitAdd(dir, filepath);
        } else {
          await git.add({
            fs: this.gitFs.fs,
            dir,
            gitdir: gitCache,
            filepath,
          });
          await git.add({
            fs: this.gitFs.fs,
            dir,
            filepath,
          });
        }
      } else {
        if (this.gitFs.isElectron) {
          await window.fsApi.gitRemove(dir, filepath);
        } else {
          await git.remove({
            fs: this.gitFs.fs,
            dir,
            gitdir: gitCache,
            filepath,
          });
          await git.remove({ fs: this.gitFs.fs, dir, filepath });
        }
      }
    } catch (error) {
      debugLogError('Could not stage file');
      throw error;
    }
  }

  async gitUnStageFile(r: RepoAccessObject, filepath: string) {
    const dir = getRepoPath(r);

    try {
      if (this.gitFs.isElectron) {
        await window.fsApi.gitResetIndex(dir, filepath);
      } else {
        await git.resetIndex({
          fs: this.gitFs.fs,
          gitdir: gitCache,
          dir,
          filepath,
        });

        await git.resetIndex({
          fs: this.gitFs.fs,
          dir,
          filepath,
        });
      }
    } catch (err) {}
  }

  async resetBranch(
    r: RepoAccessObject,
    currentBranch: string,
    commitHash: string,
  ) {
    const dir = getRepoPath(r);

    try {
      if (this.gitFs.isElectron) {
        await window.fsApi.gitWriteRef(dir, currentBranch, commitHash);
        await window.fsApi.gitCheckout(dir, currentBranch);
      } else {
        await git.writeRef({
          fs: this.gitFs.fs,
          dir,
          ref: `refs/heads/${currentBranch}`,
          value: commitHash,
          force: true,
        });

        await git.checkout({
          fs: this.gitFs.fs,
          dir,
          ref: currentBranch,
          force: true,
        });

        await this.gitFs.copyGit(r);
      }
    } catch (error: any) {
      debugLogError(`Failed to reset branch to ${commitHash}`);
      throw error;
    }
  }

  revertFileToHEAD = async (r: RepoAccessObject, filepath: string) => {
    const dir = getRepoPath(r);
    if (this.gitFs.isElectron) {
      window.fsApi.revertFileToHEAD(dir, filepath);
    } else {
      const headOid = await git.resolveRef({
        fs: this.gitFs.fs,
        dir,
        ref: 'HEAD',
      });

      // Read the file's blob from HEAD
      const { blob } = await git.readBlob({
        fs: this.gitFs.fs,
        dir,
        oid: headOid,
        filepath,
      });

      await this.gitFs.createFile(r, filepath, blob);
      await git.add({ fs: this.gitFs.fs, dir, filepath });
      await this.gitFs.copyGit(r);
    }
  };

  handleGetFileDiff = async (r: RepoAccessObject, filepath: string) => {
    const dir = getRepoPath(r);

    const headOid = await git.resolveRef({
      fs: this.gitFs.fs,
      dir,
      ref: 'HEAD',
    });

    // Read the file's blob from HEAD
    const { blob } = await git.readBlob({
      fs: this.gitFs.fs,
      dir,
      oid: headOid,
      filepath,
    });

    const oldFile = new TextDecoder('utf-8').decode(blob);
    const newBlob = await this.gitFs.getFileContent(r, filepath);
    if (!newBlob)
      return {
        oldFile,
        newFile: '',
      };

    const newFile = newBlob.content;

    return { oldFile, newFile };
  };
}
