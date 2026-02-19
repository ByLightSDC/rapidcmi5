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
import { FolderStructWithMtime, getRepoPath, GitFS } from '../utils/fileSystem';
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
    await resolveStashStatus(r, modifiedFilesAfter);

    setModifiedFiles(modifiedFilesAfter);
  };

  const resolveDir = async (r: RepoAccessObject, dirpath: string) => {
    let changedFiles = await gitOperator.gitRepoStatus(r, [dirpath]);

    const newFiles = changedFiles.map((f) => f.name);
    let status = [...modifiedFiles];
    status = status.filter((f) => !newFiles.includes(f.name));
    status = [...status, ...changedFiles];

    setModifiedFiles(status);
  };
  const flattenFolders = (
    folders: FolderStructWithMtime[],
  ): FolderStructWithMtime[] => {
    const result: FolderStructWithMtime[] = [];

    function recurse(folderList: FolderStructWithMtime[]) {
      for (const folder of folderList) {
        result.push(folder);
        if (folder.children) {
          recurse(folder.children);
        }
      }
    }

    recurse(folders);
    return result;
  };

  const resolveGitRepoStatus = useCallback(
    async (r: RepoAccessObject) => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setIsGettingRepoStatus(true);

      try {
        const repoPath = getRepoPath(r);
        let status: ModifiedFile[];

        if (fsInstance.isElectron) {
          status = await gitOperator.gitRepoStatus(r);
        } else {
          const folderStructure = await fsInstance.getFolderStructureWithMtime(
            repoPath,
            '',
          );
          const flattenedStruct = flattenFolders(folderStructure).filter(
            (node) => !node.isBranch,
          );
          const lastCommitTime = await gitOperator.gitGetLastCommitTime(r);

          // Get all file paths
          const allFilePaths = flattenedStruct.map((folder) => folder.id);

          // Get untracked files
          const { untracked, deleted, needsUnstage} =
            await gitOperator.gitGetUntrackedAndDeletedFiles(r, allFilePaths);

          const untrackedSet = new Set(untracked);
          const needsUnstageSet = new Set(needsUnstage);


          // Filter to only tracked files modified after last commit
          const recentlyModified = flattenedStruct
            .filter((folder) => {
              // Only include files (not directories)
              if (folder.isBranch) return false;
              if (!folder.mtime) return false;

              // Exclude untracked files
              if (untrackedSet.has(folder.id)) return false;

              // Include if modified after last commit
              return folder.mtime > lastCommitTime;
            })
            .map((folder) => folder.id);

          const untrackedStatus: ModifiedFile[] = untracked.map((file) => {
            return { name: file, status: 'untracked' };
          });

          // unstage these files
          const unstageFiles = await gitOperator.gitRepoStatus(r, needsUnstage)
          const removedFiles = await gitOperator.gitRemoveAllModified(r,unstageFiles);
          
          // Only check recently modified tracked files
          
          const combined = [...deleted, ...recentlyModified];
          status =
            combined.length > 0
              ? await gitOperator.gitRepoStatus(r, combined)
              : [];
          status = [...status, ...untrackedStatus];
        }

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
