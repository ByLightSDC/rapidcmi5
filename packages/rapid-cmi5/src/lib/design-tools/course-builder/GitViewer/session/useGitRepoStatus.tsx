import { ReadCommitResult } from 'isomorphic-git';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';

import { stagedStatuses } from '../utils/StatusMatrix';
import { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';
import {
  RepoAccessObject,
  RepoState,
} from '../../../../redux/repoManagerReducer';
import { debugLog, debugLogError } from '@rapid-cmi5/ui';
import { GitFS } from '../utils/fileSystem';
import { failedMergePath, GitOperations } from '../utils/gitOperations';

export function useGitRepoStatus(
  repoAccessObject: RepoAccessObject | null,
  isGitLoaded: boolean,
  fsInstance: GitFS,
) {
  const { currentBranch }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );
  const gitOperator = new GitOperations(fsInstance);

  const gettingRepoStatus = useRef(false);

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
    if (!fsInstance.isBrowserFsLoaded) return;
    try {
      if (!currentBranch) return;

      const numberCommits = await gitOperator.getCommitsToPushCount(
        r,
        currentBranch,
      );
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

  const resolveFile = async (r: RepoAccessObject, filepath: string) => {
    const modifiedFile = await gitOperator.gitResolveFile(r, filepath);
    let modifiedFilesAfter = [...modifiedFiles];
    if (
      modifiedFile.status === 'unknown' ||
      modifiedFile.status === 'unmodified'
    ) {
      modifiedFilesAfter = modifiedFilesAfter.filter(
        (f) => f.name !== filepath,
      );
    } else {
      if (modifiedFilesAfter.find((f) => f.name === modifiedFile.name)) {
        modifiedFilesAfter = modifiedFilesAfter.map((f) =>
          f.name === filepath ? modifiedFile : f,
        );
      } else {
        modifiedFilesAfter = [...modifiedFilesAfter, modifiedFile];
      }
    }
    await fsInstance.writeModifiedFiles(r, modifiedFilesAfter);
    await resolveStashStatus(r, modifiedFilesAfter);

    setModifiedFiles(modifiedFilesAfter);
  };

  const resolveDir = async (r: RepoAccessObject, dirpath: string) => {
    let changedFiles = await gitOperator.gitRepoStatus(r, [dirpath]);

    const newFiles = changedFiles.map((f) => f.name);
    let status = [...modifiedFiles];
    status = status.filter((f) => !newFiles.includes(f.name));
    status = [...status, ...changedFiles];

    await fsInstance.writeModifiedFiles(r, status);

    setModifiedFiles(status);
  };

  const resolveGitRepoStatus = useCallback(
    async (
      r: RepoAccessObject,
      changedFiles?: ModifiedFile[] | undefined,
      fullResolve?: boolean,
    ) => {
      if (!gettingRepoStatus.current) {
        gettingRepoStatus.current = true;

        try {
          let status: ModifiedFile[];

          if (fullResolve) {
            status = await gitOperator.gitRepoStatus(r);
          } else if (changedFiles) {
            const newFiles = changedFiles.map((f) => f.name);
            status = [...modifiedFiles];
            status = status.filter((f) => !newFiles.includes(f.name));
            status = [...status, ...changedFiles];
          } else {
            const savedFiles = await fsInstance.readModifiedFiles(r);

            status = await gitOperator.gitRepoStatus(r, savedFiles);
          }

          await fsInstance.writeModifiedFiles(r, status);

          setModifiedFiles((prev) => {
            const isSame = JSON.stringify(prev) === JSON.stringify(status);
            return isSame ? prev : status;
          });

          const commits = await gitOperator.gitCommits(r);
          setGitRepoCommits(commits);

          await resolveStashStatus(r, status);

          try {
            const res = await fsInstance.getFileContent(r, failedMergePath);
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
          throw error;
          debugLogError(error);
        }
        gettingRepoStatus.current = false;
      }
    },
    [repoAccessObject, modifiedFiles],
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

    // ensure that the modified file cache is not in this list, otherwise remove it
    // for (const file of modifiedFiles) {
    //   if (file.name.endsWith(modifiedFileCache)) {
    //     setModifiedFiles((prev) =>
    //       prev.filter((f) => f.name.endsWith(modifiedFileCache)),
    //     );
    //     return;
    //   }
    // }

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
  };
}
