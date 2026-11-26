import { getFailedMergePath } from '../utils/gitMetadata';
import { ReadCommitResult } from 'isomorphic-git';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';

import { stagedStatuses } from '../utils/StatusMatrix';
import { RepoAccessObject } from '../../../../redux/repoManagerReducer';
import { debugLog, debugLogError } from '@rapid-cmi5/ui';
import { GitFS } from '../utils/fileSystem';
import { GitOperations } from '../utils/gitOperations';

export function useGitRepoStatus(
  repoAccessObject: RepoAccessObject | null,
  isGitLoaded: boolean,
  fsInstance: GitFS,
) {
  const gitOperator = useMemo(
    () => new GitOperations(fsInstance),
    [fsInstance, repoAccessObject],
  );

  const inFlightRef = useRef(false);
  const [isGettingRepoStatus, setIsGettingRepoStatus] = useState(false);

  const [modifiedFiles, setModifiedFiles] = useState<ModifiedFile[]>([]);
  const [stashFiles, setStashFiles] = useState<ModifiedFile[]>([]);
  const [isInMerge, setIsInMerge] = useState<boolean>(false);

  const [gitRepoCommits, setGitRepoCommits] = useState<ReadCommitResult[]>([]);
  const [canStage, setCanStage] = useState(false);
  const [canCommit, setCanCommit] = useState(false);
  const [canStash, setCanStash] = useState(false);
  const [canPop, setCanPop] = useState(false);

  const [canPush, setCanPush] = useState(false); //TODO
  const [unpushedCommits, setUnpushedCommits] = useState(0); //TODO
  const [numStaged, setNumStaged] = useState(0);
  const [isRepoConnectedToRemote, setIsRepoConnectedToRemote] = useState(true);

  const resolvePushStatus = async (r: RepoAccessObject) => {
    try {
      // Read HEAD after checkout; the Redux selector may still hold the previous branch.
      const branch = await gitOperator.getCurrentGitBranch(r);
      if (!branch) return;

      const numberCommits = await gitOperator.getCommitsToPushCount(r, branch);
      setCanPush(numberCommits > 0);
      setUnpushedCommits(numberCommits);
    } catch (error: any) {
      debugLogError('Could not retrieve push status');
      setCanPush(false);
      setUnpushedCommits(0);
    }
  };

  const resetRepoStatus = async () => {
    setModifiedFiles([]);
    setCanCommit(false);
    setCanPop(false);
    setCanPush(false);
    setUnpushedCommits(0);
    setNumStaged(0);
    setIsInMerge(false);
    setGitRepoCommits([]);
  };

  const resolveFile = async (
    r: RepoAccessObject,
    filepath: string | string[],
    resolvedStatus?: ModifiedFile[],
  ) => {
    const paths = Array.isArray(filepath) ? filepath : [filepath];
    const status =
      resolvedStatus ??
      (Array.isArray(filepath)
        ? await gitOperator.gitRepoStatus(r, paths)
        : [await gitOperator.gitResolveFile(r, filepath)]);
    const affected = new Set(paths);
    const changed = status.filter(
      (file) => file.status !== 'unknown' && file.status !== 'unmodified',
    );
    setModifiedFiles((previous) => [
      ...previous.filter((file) => !affected.has(file.name)),
      ...changed,
    ]);
    // The modifiedFiles effect refreshes stash actions. Staging only changes
    // the index; it doesn't require reloading history or scanning the worktree.
  };

  const resolveDir = async (r: RepoAccessObject, dirpath: string) => {
    let changedFiles = await gitOperator.gitRepoStatus(r, [dirpath]);

    const newFiles = changedFiles.map((f) => f.name);
    let status = [...modifiedFiles];
    status = status.filter((f) => !newFiles.includes(f.name));
    status = [...status, ...changedFiles];

    setModifiedFiles(status);
  };
  const resolveGitRepoStatus = useCallback(
    async (r: RepoAccessObject) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setIsGettingRepoStatus(true);

      try {
        // Reuse timestamp-verified status; HEAD/index changes invalidate it.
        // This scan never unstages files or writes course content.
        const status = await gitOperator.gitRepoStatusFast(r);

        setModifiedFiles((prev) => {
          const isSame = JSON.stringify(prev) === JSON.stringify(status);
          return isSame ? prev : status;
        });

        const commits = await gitOperator.gitCommits(r);
        setGitRepoCommits(commits);

        await resolveStashStatus(r, status);

        try {
          const res = await fsInstance.getFileContent(
            r,
            getFailedMergePath(fsInstance.isElectron),
          );
          const mergeFileExists = res != null;
          setIsInMerge(mergeFileExists);
          if (mergeFileExists) {
            for (const file of status) {
              // this could be a file with merge conflicts
              if (
                file.status === 'staged_with_changes' ||
                file.status === 'modified'
              ) {
                const res = await fsInstance.getFileContent(r, file.name);
                if (!res) continue;

                const conflictRegex = /^<{7}[\s\S]*?={7}[\s\S]*?>{7}/m;
                if (conflictRegex.test(res?.content)) {
                  file.hasMergeConflict = true;
                }
              }
            }
          }
        } catch (error: any) {
          setIsInMerge(false);
        }
      } catch (error: any) {
        debugLogError('Failed to get repo status: ' + error);
        throw error;
      } finally {
        inFlightRef.current = false;
        setIsGettingRepoStatus(false);
      }
    },
    [modifiedFiles],
  );

  const resolveStashStatus = async (
    r: RepoAccessObject,
    status: ModifiedFile[],
  ) => {
    const stashList = await gitOperator.gitListStash(r);

    const stashStatus = await gitOperator.getStashStatus(r);

    if (stashStatus) {
      setStashFiles((prev) => {
        const isSame = JSON.stringify(prev) === JSON.stringify(stashStatus);
        return isSame ? prev : stashStatus;
      });
    }

    const stashableFiles = status.filter((f) => f.status != 'untracked');

    const hasModified = stashableFiles.length > 0;
    const hasStashes = stashList.length > 0;

    setCanStash(hasModified && !hasStashes);
    setCanPop(hasStashes);
  };

  const resolveRemoteRepoStatus = async (r: RepoAccessObject) => {
    try {
      const checkRemoteRepo = async () => {
        try {
          const remoteRepos = await gitOperator.listRepoRemotes(r);
          const hasRemotes = remoteRepos.length > 0;
          setIsRepoConnectedToRemote(hasRemotes);
        } catch (error: any) {
          debugLog('Failed to list repo remotes:', error);
          setIsRepoConnectedToRemote(false);
        }
      };

      checkRemoteRepo();
    } catch (error: any) {
      debugLog(error);
    }
  };

  useEffect(() => {
    if (!repoAccessObject) {
      return;
    }
    let hasStaged = false;
    let hasUnstaged = false;
    let numOfStaged = 0;

    for (let file of modifiedFiles) {
      if (stagedStatuses.includes(file.status)) {
        hasStaged = true;
        numOfStaged++;
      } else {
        hasUnstaged = true;
      }
    }
    setNumStaged(numOfStaged);
    setCanCommit(hasStaged);
    setCanStage(hasUnstaged);

    if (repoAccessObject && isGitLoaded) {
      resolveStashStatus(repoAccessObject, modifiedFiles);
    }
  }, [modifiedFiles, isGitLoaded, repoAccessObject]);

  return {
    modifiedFiles,
    stashFiles,
    gitRepoCommits,
    canStage,
    canCommit,
    setCanCommit,
    canStash,
    canPop,
    numStaged,
    resolveGitRepoStatus,
    resolveRemoteRepoStatus,
    setGitRepoCommits,
    resolvePushStatus,
    canPush,
    unpushedCommits,
    isRepoConnectedToRemote,
    setIsRepoConnectedToRemote,
    isInMerge,
    resetRepoStatus,
    resolveFile,
    resolveDir,
    resolveStashStatus,
    gettingRepoStatus: isGettingRepoStatus,
  };
}
