// hooks/useGitOperations.ts
import { useCallback, useState } from 'react';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';
import {
  CreateCloneType,
  CreateCommitType,
  GitConfigType,
  ImportRepoZipType,
  PullType,
  PushType,
} from '../../CourseBuilderApiTypes';
import { useDispatch, useSelector } from 'react-redux';
import {
  addRepo,
  recalculateFileTree,
  removeRepo,
  RepoAccessObject,
  RepoState,
  setCurrentRepo,
  setCurrentWorkingDir,
  setFileContent,
  setSelectedFile,
} from '../../../../redux/repoManagerReducer';
import { debugLog, debugLogError } from '@rangeos-nx/ui/branded';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  cloneFailMessage,
  importFailMessage,
  pullFailMessage,
  repoNameInUseMessage,
} from './constants';
import {
  handleRepoDeletion,
  setRepoViewScrollTop,
} from '../../../../redux/courseBuilderReducer';
import JSZip from 'jszip';
import { getRepoAccess } from './GitContext';
import { GitOperations } from '../utils/gitOperations';
import { GitFS } from '../utils/fileSystem';
import { slugifyPath } from '../utils/useCourseOperationsUtils';

export const useGitOperations = (
  fsInstance: GitFS,
  repoAccessObject: RepoAccessObject | null,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const gitOperator = new GitOperations(fsInstance);

  const { availableRepos, currentBranch, fileSystemType }: RepoState =
    useSelector((state: RootState) => state.repoManager);

  const removeRepoFileSelection = () => {
    dispatch(setFileContent({ content: null, type: null }));
    dispatch(setSelectedFile(null));
  };

  const cloneRemoteRepo = async (req: CreateCloneType) => {
    debugLog('clone repo', req);
    if (availableRepos.includes(req.repoDirName)) {
      throw Error(repoNameInUseMessage);
    }

    try {
      const r = await gitOperator.cloneRepo(
        req.repoDirName,
        fileSystemType,
        req.repoRemoteUrl,
        req.repoBranch,
        req.repoUsername,
        req.repoPassword,
        req.shallowClone,
      );
      
      await fsInstance.writeModifiedFiles(r, []);
      debugLog('adding repo', r.repoName);
      dispatch(setRepoViewScrollTop(0));
      dispatch(addRepo(r.repoName));

      await setConfig(r, {
        authorEmail: req.authorEmail,
        authorName: req.authorName,
        remoteRepoUrl: req.repoRemoteUrl,
      });
    } catch (error: any) {
      debugLog('Failed to add repo ', req.repoDirName);
      let errorMessage = cloneFailMessage;
      if (error.data?.response) {
        errorMessage = error?.data?.response;
      } else if (error?.message) {
        errorMessage = error?.message;
      }
      throw Error(errorMessage);
    }
  };

  const handleImportRepoZip = async (req: ImportRepoZipType) => {
    debugLog('import repo zip', req);

    const cleanedName = slugifyPath(req.repoDirName);

    const r: RepoAccessObject = { repoName: cleanedName, fileSystemType };

    if (!req.zipFile) return;
    try {
      const arrayBuffer = await req.zipFile.arrayBuffer();

      const zip = await JSZip.loadAsync(arrayBuffer);
      await fsInstance.importGitRepoZip(zip, r);

      debugLog('adding repo', cleanedName);
      dispatch(setRepoViewScrollTop(0));
      dispatch(addRepo(cleanedName));
      dispatch(setCurrentRepo(cleanedName));

      const remoteRepoUrls = await gitOperator.listRepoRemotes(r);

      removeRepoFileSelection();
      setConfig(r, {
        authorEmail: req.authorEmail,
        authorName: req.authorName,
        remoteRepoUrl: remoteRepoUrls[0]?.url || '',
      });
    } catch (error: any) {
      debugLog('Failed to import repo ', cleanedName);
      let errorMessage = importFailMessage;
      if (error.data?.response) {
        errorMessage = error?.data?.response;
      } else if (error?.message) {
        errorMessage = error?.message;
      }
      await fsInstance.deleteRepo(r);
      throw Error(errorMessage);
    }
  };

  const [currentGitConfig, setCurrentGitConfig] = useState<GitConfigType>({
    authorEmail: '',
    authorName: '',
    remoteRepoUrl: '',
  });

  const revertFile = useCallback(
    async (filepath: string) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      await gitOperator.revertFileToHEAD(r, filepath);
    },
    [repoAccessObject],
  );

  const getFileDiff = useCallback(
    async (filepath: string) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);

      return await gitOperator.handleGetFileDiff(r, filepath);
    },
    [repoAccessObject],
  );

  const stageFile = useCallback(
    async (filepath: string) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      await gitOperator.gitStageFile(r, filepath);
    },
    [repoAccessObject],
  );

  const unStageFile = useCallback(
    async (filepath: string) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      await gitOperator.gitUnStageFile(r, filepath);
    },
    [repoAccessObject],
  );

  const stageFiles = useCallback(
    async (modifiedFiles: ModifiedFile[]) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      return await gitOperator.gitAddAllModified(r, modifiedFiles);
    },
    [repoAccessObject],
  );

  const unstageFiles = useCallback(
    async (modifiedFiles: ModifiedFile[]) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      return await gitOperator.gitRemoveAllModified(r, modifiedFiles);
    },
    [repoAccessObject],
  );

  const commit = useCallback(
    async (req: CreateCommitType) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);

      await gitOperator.setGitConfig(r, {
        authorEmail: req.authorEmail,
        authorName: req.authorName,
        remoteRepoUrl: currentGitConfig.remoteRepoUrl,
      });

      await gitOperator.gitCommit(
        r,
        req.commitMessage,
        req.authorEmail,
        req.authorName,
      );
    },
    [repoAccessObject, currentGitConfig],
  );

  const stashChanges = useCallback(async () => {
    const r: RepoAccessObject = getRepoAccess(repoAccessObject);
    await gitOperator.gitStash(r);
  }, [repoAccessObject]);

  const stashPopChanges = useCallback(async (): Promise<ModifiedFile[]> => {
    const r: RepoAccessObject = getRepoAccess(repoAccessObject);
    return await gitOperator.gitStashPop(r);
  }, [repoAccessObject]);

  const pushRepo = useCallback(
    async (req: PushType) => {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      await gitOperator.gitPush(r, req.repoUsername, req.repoPassword);
    },
    [repoAccessObject],
  );

  const setConfig = useCallback(
    async (r: RepoAccessObject, req: GitConfigType) => {
      await gitOperator.setGitConfig(r, req);
      setCurrentGitConfig(req);
    },
    [setCurrentGitConfig],
  );

  const changeRepo = async (name: string) => {
    const cleanedName = slugifyPath(name);
    dispatch(setCurrentRepo(cleanedName));
    dispatch(setCurrentWorkingDir('/'));
  };

  const getCurrentGitConfig = async () => {
    try {
      const r: RepoAccessObject = getRepoAccess(repoAccessObject);
      const gitConfig = await gitOperator.getGitConfig(r);
      return gitConfig;
    } catch (error) {
      return {
        authorName: '',
        authorEmail: '',
        remoteRepoUrl: '',
      } as GitConfigType;
    }
  };

  const gitCommitReset = async (commitHash: string) => {
    if (!currentBranch) return;
    const r: RepoAccessObject = getRepoAccess(repoAccessObject);
    await gitOperator.resetBranch(r, currentBranch, commitHash);
  };

  const pullRepo = async (req: PullType) => {
    if (!currentBranch) return;
    const r: RepoAccessObject = getRepoAccess(repoAccessObject);
    debugLog('pulling repo', r.repoName);

    try {
      await gitOperator.gitPull(
        r,
        currentBranch,
        req.repoUsername,
        req.repoPassword,
        req.allowConflicts,
      );
      // Need to show the new files created or deleted fron the pull
    } catch (error: any) {
      debugLog('Failed to pull repo', r.repoName);
      let errorMessage = pullFailMessage;
      if (error.data?.response) {
        errorMessage = error?.data?.response;
      } else if (error?.message) {
        errorMessage = error?.message;
      }
      throw Error(errorMessage);
    } finally {
      dispatch(recalculateFileTree(r));
    }
  };

  const handleRenameCurrentRepo = async (destR: RepoAccessObject) => {
    debugLog('rename repo');
    try {
      const srcR = getRepoAccess(repoAccessObject);
      await fsInstance.renameRepo(srcR, destR);
      dispatch(removeRepo(srcR.repoName));
      dispatch(addRepo(destR.repoName));
      dispatch(setCurrentRepo(destR.repoName));
    } catch (error: any) {
      debugLogError('Could not change the repo name');
      throw error;
    }
  };

  const deleteRepo = async (r: RepoAccessObject) => {
    debugLog('delete repo');

    try {
      // Handle synchronous task first, changing repo will set off UEs
      await fsInstance.deleteRepo(r);
      dispatch(setCurrentRepo(null));
      removeRepoFileSelection();
      dispatch(removeRepo(r.repoName));
      dispatch(handleRepoDeletion(r.repoName));
    } catch (error) {
      console.error(
        'Could not delete the old repository ' + (error as Error).message,
      );
    }
  };

  const resolveGitConfig = async () => {
    const gitConfig = await getCurrentGitConfig();
    setCurrentGitConfig(gitConfig);
  };

  return {
    cloneRemoteRepo,
    deleteRepo,
    changeRepo,
    stageFiles,
    commit,
    stashChanges,
    stashPopChanges,
    pushRepo,
    pullRepo,
    gitCommitReset,
    setConfig,
    currentGitConfig,
    stageFile,
    unStageFile,
    unstageFiles,
    revertFile,
    handleImportRepoZip,
    getFileDiff,
    handleRenameCurrentRepo,
    resolveGitConfig,
  };
};
