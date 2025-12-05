/* eslint-disable @typescript-eslint/no-empty-function */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Buffer } from 'buffer';

import { useDispatch, useSelector } from 'react-redux';
import { CourseData } from '@rangeos-nx/types/cmi5';
import {
  CreateCloneType,
  CreateCommitType,
  CreateCourseType,
  CreateLocalRepoType,
  DownloadCmi5Type,
  GitConfigType,
  ImportRepoZipType,
  PullType,
  PushType,
} from '../../CourseBuilderApiTypes';
import { auth } from '@rangeos-nx/ui/keycloak';

import { ViewModeEnum } from '../../CourseBuilderTypes';
import {
  debugLog,
  debugLogError,
  defaultCourseData,
} from '@rangeos-nx/ui/branded';
import { ModifiedFile } from '../Components/GitActions/GitFileStatus';
import { ReadCommitResult } from 'isomorphic-git';
import { sandboxIntro } from '../../../rapidcmi5_mdx/constants/sandboxIntro';
import { useGitRepoStatus } from './useGitRepoStatus';
import { useGitOperations } from './useGitOperations';
import { sandBoxName } from './constants';
import {
  useCourseOperations,
} from './useCourseOperations';
import { usePublishActions } from './usePublishActions';
import { useImageCache } from './useImageCache';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { INode } from 'react-accessible-treeview';
import { FileContent, getRepoPath, GitFS } from '../utils/fileSystem';
import { GitOperations } from '../utils/gitOperations';
import JSZip from 'jszip';
import { FolderStruct } from '@rangeos-nx/cmi5-build/common';
import {
  currentSlideNum,
  updateCourseData,
  setIsLessonMounted,
  setRepoViewScrollTop,
  changeViewMode,
  courseOperations,
} from '../../../../redux/courseBuilderReducer';
import {
  RepoAccessObject,
  RepoState,
  fsType,
  recalculateFileTree,
  setCurrentFileSystemType,
  setCurrentRepo,
  setFileContent,
  setSelectedFile,
  setLastSelectedPath,
  addRepo,
  setCurrentBranch,
  setAllBranches,
  setAvailableRepos,
  Course,
} from '../../../../redux/repoManagerReducer';
import { AppDispatch, RootState } from '../../../../redux/store';
import { getFsInstance } from '../utils/gitFsInstance';
import { createNewCourseInFs, createUniquePath, slugifyPath } from './useCourseOperationsUtils';

interface IGitContext {
  currentCourse?: Course | null;
  currentRepo: string | null;
  availableCourses: Course[];
  availableRepos: string[];
  gitRepoCommits: ReadCommitResult[];
  canStage: boolean;
  canCommit: boolean;
  canStash: boolean;
  canPop: boolean;
  canPush: boolean;
  isFsLoaded: boolean;
  isGitLoaded: boolean;
  unpushedCommits: number;
  isRepoConnectedToRemote: boolean;
  currentGitConfig: GitConfigType;
  isElectron: boolean;
  handleChangeRepo: (name: string) => void;
  handleChangeFileSystem: (fsType: fsType) => void;
  handleChangeRepoName: (name: string) => void;
  handleLoadCourse: (coursePath: string) => void;
  handlePathExists: (path: string) => Promise<boolean>;
  handleBlobImageFile: (
    r: RepoAccessObject,
    filePath: string,
    fileType: string,
  ) => Promise<Blob | MediaSource | null>;
  handleGetFolderStructure: (
    dir: string,
    getContents?: boolean,
    zip?: JSZip | null,
  ) => Promise<FolderStruct[]>;
  handleStageAll: (
    useCache?: boolean,
    changedFiles?: string[],
  ) => Promise<void>;
  handleGetDiff: (
    filepath: string,
  ) => Promise<{ oldFile: string; newFile: string }>;
  handleUnstageAll: () => void;
  handleGitStashChanges: () => Promise<void>;
  handleGitStashPopChanges: () => Promise<void>;
  handleGitCommitReset: (commitHash: string) => void;
  handlePull: (req: PullType) => Promise<void>;
  handleDownloadCmi5Zip: (req: DownloadCmi5Type) => void;
  syncCurrentCourseWithGit: (courseData: CourseData) => Promise<string[]>;
  handleAutoSelectCourse: () => void;
  handleCloneRepo: (req: CreateCloneType) => void;
  handleDeleteCurrentRepo: () => Promise<void>;
  handleDeleteCourse: (courseName: string) => void;
  handleCommit: (req: CreateCommitType) => Promise<void>;
  handleCheckoutBranch: (branch: string) => Promise<void>;
  handleResolveMerge: () => Promise<void>;
  handleGitSetConfig: (req: GitConfigType) => void;
  handleCreateCourse: (req: CreateCourseType) => void;
  handleStageFile: (filepath: string) => Promise<void>;
  handleUnStageFile: (filepath: string) => void;
  handleGetUniqueFilePath: (
    r: RepoAccessObject,
    slideTitle: string,
    currentAuDir: string,
    extension?: string,
  ) => Promise<string>;
  handleGetUniqueDirPath: (
    r: RepoAccessObject,
    slideTitle: string,
    currentAuDir: string,
  ) => Promise<string>;
  handleRevertFile: (filepath: string) => void;
  handleRemoveFile: (filepath: string) => void;
  handleCreateFile: (
    filepath: string,
    isDir: boolean,
    data?: string | Uint8Array,
  ) => Promise<void>;
  handleUpdateFile: (filepath: string, data: string) => Promise<void>;
  handleDeleteFile: (filepath: string, isDir: boolean) => Promise<void>;
  handleRenameFile: (oldFilepath: string, newName: string) => Promise<void>;
  handleGetFileContents: (filepath: string) => Promise<FileContent | null>;
  handleCopyFile: (src: string, dest: string) => Promise<void>;
  getLocalFileBlob: (
    filePath: string,
    slidePath: string,
    fileType?: string,
  ) => Promise<Blob | MediaSource | null>;
  getLocalFileBlobUrl: (
    filePath: string,
    slidePath: string,
    fileType?: string,
    shouldNotCache?: boolean,
  ) => Promise<string | null>;
  handleNavToDesigner: () => void;
  handleNavToGitView: () => Promise<void>;
  handleNavToFile: (filePath: string) => void;
  handlePushRepo: (req: PushType) => Promise<void>;
  modifiedFiles: ModifiedFile[];
  stashFiles: ModifiedFile[];
  isInMerge: boolean;
  numStaged: number;
  resolvePCTEProjects: () => Promise<any[]>;
  publishToPCTE: (repoSrc: string, repoDest: string) => void;
  handleGetCourseData: (coursePath: string) => Promise<CourseData>;
  directoryTree: INode<IFlatMetadata>[];
  handleRenameCourse: (newCourseName: string) => void;
  handleImportRepoZip: (req: ImportRepoZipType) => void;
  handleCreateLocalCourse: (req: CreateLocalRepoType) => void;
}

interface tProviderProps {
  isEnabled?: boolean;
  children?: JSX.Element;
  isElectron?: boolean;
}

/**
 * Context for Building CMI5 Course
 * @see ICourseBuilderContext
 * @return {Context} React Context
 */
const defaultGitContext: IGitContext = {
  currentRepo: null,
  currentCourse: null,
  availableCourses: [],
  availableRepos: [],
  canStage: false,
  canCommit: false,
  canStash: false,
  canPop: false,
  canPush: false,
  isFsLoaded: false,
  isGitLoaded: false,
  unpushedCommits: 0,
  isRepoConnectedToRemote: false,
  currentGitConfig: {} as GitConfigType,
  gitRepoCommits: [],
  handlePathExists: async () => false,
  handleBlobImageFile: async (r, filePath, fileType) => null,
  handleGetFolderStructure: async () => [],
  handleDeleteCurrentRepo: async () => {},
  handleDeleteCourse: () => {},
  handleGitStashChanges: async () => {},
  handleGitStashPopChanges: async () => {},
  handleGitCommitReset: () => {},
  handleChangeRepo: () => {},
  handleChangeFileSystem: () => {},
  handleChangeRepoName: () => {},
  handleGitSetConfig: () => {},
  handleCloneRepo: () => {},
  handleCommit: async () => {},
  handleResolveMerge: async () => {},
  handleLoadCourse: () => {},
  handleCheckoutBranch: async () => {},
  handlePull: async (): Promise<void> => {},
  handleDownloadCmi5Zip: () => {},
  handleNavToDesigner: () => {},
  handleNavToGitView: async () => {},
  handleNavToFile: () => {},
  handleStageAll: async () => {},
  handleGetDiff: async (_filePath: string): Promise<any> => {
    oldFile: '';
    newFile: '';
  },
  handleUnstageAll: () => {},
  modifiedFiles: [],
  isElectron: false,
  isInMerge: false,
  stashFiles: [],
  handleStageFile: async () => {},
  handleUnStageFile: () => {},
  handleGetUniqueFilePath: async (
    r: RepoAccessObject,
    slideTitle: string,
    currentAuDir: string,
    extension?: string,
  ): Promise<string> => '',
  handleGetUniqueDirPath: async (
    r: RepoAccessObject,
    auDir: string,
    repoPath: string,
  ): Promise<string> => '',
  handleRenameFile: async (
    _oldpath: string,
    _newname: string,
  ): Promise<void> => {},
  handleUpdateFile: async (
    _filePath: string,
    _data: string,
  ): Promise<void> => {},
  handleCreateFile: async (
    _filePath: string,
    _isDir: boolean,
    _data?: string | Uint8Array,
  ): Promise<void> => {},
  handleDeleteFile: async (
    _filePath: string,
    _isDir: boolean,
  ): Promise<void> => {},
  handleGetFileContents: async (
    _filePath: string,
  ): Promise<FileContent | null> => null,
  handleCopyFile: async (_src: string, _dest: string): Promise<void> => {},
  handleRevertFile: () => {},
  handleRemoveFile: () => {},
  syncCurrentCourseWithGit: async () => [],
  handleAutoSelectCourse: () => {},
  handleCreateCourse: () => {},
  getLocalFileBlob: async () => null,
  getLocalFileBlobUrl: async () => null,
  handlePushRepo: async () => {},
  resolvePCTEProjects: async () => [],
  publishToPCTE: () => {},
  handleGetCourseData: async (_coursePath: string): Promise<CourseData> =>
    defaultCourseData,
  directoryTree: [],
  handleRenameCourse: () => {},
  handleImportRepoZip: () => {},
  handleCreateLocalCourse: () => {},
  numStaged: 0,
};

export const GitContext = createContext<IGitContext>(defaultGitContext);

//Required for files
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = window.Buffer || Buffer;
}

export const getRepoAccess = (repoAccessObject: RepoAccessObject | null) => {
  if (!repoAccessObject) throw Error('Repo access object was not defined');
  return repoAccessObject;
};

// Project Context Provider
// Simple functions should stay in their own hooks, functions which need data from other hooks should be created
// in this context
export const GitContextProvider: any = (props: tProviderProps) => {
  const { children, isElectron = false } = props;
  const gitFs = getFsInstance();

  const dispatch = useDispatch<AppDispatch>();

  const gitOperator = new GitOperations(gitFs);

  const {
    availableRepos,
    repoAccessObject,
    fileState,
    allBranches,
    currentBranch,
    fileSystemType,
  }: RepoState = useSelector((state: RootState) => state.repoManager);

  const currentAuth = useSelector(auth);
  const availableCourses = fileState?.availableCourses ?? [];
  const currentCourse = fileState.selectedCourse;
  const directoryTree = fileState.directoryTree;
  const isCopyingGit = useRef(false);
  const slideNumber = useSelector(currentSlideNum);

  const currentRepo = repoAccessObject?.repoName || null;
  const [localFileSystemLoaded, setLocalFileSystemLoaded] = useState(false);
  const [browserFileSystemLoaded, setBrowserFileSystemLoaded] = useState(false);

  const [isGitLoaded, setIsGitLoaded] = useState(false);

  const isFsLoaded = useMemo(() => {
    if (fileSystemType === fsType.inBrowser) return browserFileSystemLoaded;
    if (fileSystemType === fsType.localFileSystem) return localFileSystemLoaded;
    return false;
  }, [fileSystemType, browserFileSystemLoaded, localFileSystemLoaded]);

  const { resolvePCTEProjects, publishToPCTE, handleDownloadCmi5Zip } =
    usePublishActions(gitFs, repoAccessObject);

  const { getLocalFileBlob, getLocalFileBlobUrl } = useImageCache(
    repoAccessObject,
    currentCourse,
    slideNumber,
    gitFs,
  );

  const {
    modifiedFiles,
    stashFiles,
    gitRepoCommits,
    canStage,
    canCommit,
    canStash,
    canPop,
    numStaged,
    resolveGitRepoStatus,
    resolveRemoteRepoStatus,
    resolvePushStatus,
    canPush,
    unpushedCommits,
    isRepoConnectedToRemote,
    setIsRepoConnectedToRemote,
    isInMerge,
    resetRepoStatus,
    resolveFile,
    setCanCommit,
    resolveDir,
  } = useGitRepoStatus(repoAccessObject, isGitLoaded, gitFs);

  const courseOperationsSet = useSelector(courseOperations);

  const {
    handleLoadCourse,
    handleAutoSelectCourse,
    getCourseData,
    createCourse,
    syncCurrentCourseWithGit,
    deleteCourse,
    handleRenameCourse,
    getFirstCoursePath,
  } = useCourseOperations(
    gitFs,
    repoAccessObject,
    fileState,
    courseOperationsSet,
  );

  const {
    cloneRemoteRepo,
    changeRepo,
    stageFiles,
    commit,
    stashChanges,
    stashPopChanges,
    pushRepo,
    setConfig,
    deleteRepo,
    pullRepo,
    currentGitConfig,
    gitCommitReset,
    stageFile,
    unStageFile,
    unstageFiles,
    revertFile,
    handleImportRepoZip,
    getFileDiff,
    handleRenameCurrentRepo,
    resolveGitConfig,
  } = useGitOperations(gitFs, repoAccessObject);

  const handleNavToDesigner = async () => {
    let courseDataToUse = defaultCourseData;

    const r = getRepoAccess(repoAccessObject);

    if (fileState.selectedCourse) {
      const courseData = await getCourseData(
        r,
        fileState.selectedCourse.basePath,
      );

      if (courseData) {
        courseDataToUse = courseData;
      }
    } else {
      const firstCourse = await getFirstCoursePath(r);
      if (firstCourse) {
        await handleLoadCourse(firstCourse.basePath);
        const courseData = await getCourseData(r, firstCourse.basePath);
        if (courseData) {
          courseDataToUse = courseData;
        }
      }
    }
    dispatch(recalculateFileTree(r));
    dispatch(updateCourseData(courseDataToUse));
    dispatch(setIsLessonMounted(false));
  };

  const handleDeleteCurrentRepo = async () => {
    const r = getRepoAccess(repoAccessObject);

    setIsGitLoaded(false);
    await deleteRepo(r);
    await resetRepoStatus();
  };

  const handleNavToGitView = async () => {
    await resolvePushStatus();
  };

  const handleStageAll = useCallback(
    async (useCache: boolean = false, changedFiles?: string[]) => {
      const r = getRepoAccess(repoAccessObject);

      // This is required due to timing issues, the exported modified files above is based on state
      // this is good for eventual consistency in the UI, but to get the most current we need to use
      // this helper for functions that require real time data
      const filesForStaging: ModifiedFile[] = useCache
        ? modifiedFiles
        : await gitOperator.gitRepoStatus(r, changedFiles);

      const afterStage = await stageFiles(filesForStaging);
      await resolveGitRepoStatus(afterStage);
      setCanCommit(true);
    },
    [modifiedFiles, resolveGitRepoStatus, stageFiles],
  );

  const handleUnstageAll = async () => {
    const chagnedFiles = await unstageFiles(modifiedFiles);
    await resolveGitRepoStatus(chagnedFiles);
    setCanCommit(false);
  };

  const handleRevertFile = async (filepath: string) => {
    const r = getRepoAccess(repoAccessObject);

    await revertFile(filepath);
    await resolveFile(r, filepath);
    dispatch(recalculateFileTree(r));
  };

  const handleGetDiff = async (filepath: string) => {
    return await getFileDiff(filepath);
  };

  const handleDeleteCourse = async (courseName: string) => {
    try {
      const r = getRepoAccess(repoAccessObject);
      await deleteCourse(r, courseName);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCloneRepo = async (req: CreateCloneType) => {
    const cleanedName = slugifyPath(req.repoDirName);

    const r: RepoAccessObject = { fileSystemType, repoName: cleanedName };
    await cloneRemoteRepo(req);

    await setConfig(r, {
      authorEmail:
        currentGitConfig.authorEmail ||
        currentAuth?.parsedUserToken?.email?.toLowerCase(),
      authorName:
        currentGitConfig.authorName || currentAuth?.parsedUserToken?.name,
      remoteRepoUrl: '',
    });
    await resetRepoStatus();
    await handleChangeRepo(cleanedName);
  };

  const handleCreateCourse = async (req: CreateCourseType) => {
    const r = getRepoAccess(repoAccessObject);

    const course = await createCourse(req);
    const modifiedFiles: ModifiedFile[] = await gitOperator.gitRepoStatus(r, [
      course.basePath,
    ]);
    await handleStageAll(
      false,
      modifiedFiles.map((f) => f.name),
    );
  };
  /*
    This function will get the course data object associated with the course name in your current 
    repo and file system.
  */
  const handleGetCourseData = async (
    courseName: string,
    getContents?: boolean,
  ): Promise<CourseData> => {
    try {
      const r = getRepoAccess(repoAccessObject);

      const res = await getCourseData(r, courseName, getContents);
      if (!res) throw Error('No course data retrieved');
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const handleChangeRepo = async (name: string) => {
    debugLog('change repo', name);
    // need to reset scroll immediately before async part...
    dispatch(setRepoViewScrollTop(0));
    await changeRepo(name);
    await resetRepoStatus();
    setIsGitLoaded(false);
  };

  /*
    This function allows you to swap between the available file systems such as in browser (IndexedDB)
    or by exposiong your local file system.
  */
  const handleChangeFileSystem = async (newFsType: fsType) => {
    try {
      if (newFsType === fsType.localFileSystem) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
        });
        if (!dirHandle) return; // user canceled

        gitFs.setDirHandle(dirHandle);
        await gitFs.openLocalDirectory(dirHandle);

        dispatch(setCurrentFileSystemType(newFsType));

        await resetRepoStatus();
        dispatch(setCurrentRepo(null));
        setIsGitLoaded(false);

        setLocalFileSystemLoaded(true);
        return;
      }

      if (newFsType === fsType.inBrowser) {
        dispatch(setCurrentFileSystemType(newFsType));

        await resetRepoStatus();
        dispatch(setCurrentRepo(null));

        setLocalFileSystemLoaded(true);
        return;
      }
    } catch (error: any) {
      debugLog('Error changing file system:', error);
    }
  };

  const handleLocalFileSystemAccess = async () => {
    try {
      await handleBrowserFileSystemAccess();
      let dirHandle = await gitFs.getDirHandle();

      if (dirHandle === undefined) {
        // for now we will just switch back to in browser if the handle is invalid
        dispatch(setCurrentFileSystemType(fsType.inBrowser));
      }
      if (dirHandle) {
        await gitFs.openLocalDirectory(dirHandle);

        setLocalFileSystemLoaded(true);
      }
    } catch (error: any) {
      debugLog(error);
    }
  };

  const handleBrowserFileSystemAccess = async () => {
    try {
      if (!gitFs.isMountStarted) {
        await gitFs.init();

        setBrowserFileSystemLoaded(true);
      }
    } catch (error: any) {
      debugLog(error);
    }
  };

  const handleRemoveFile = async (filepath: string) => {
    const r = getRepoAccess(repoAccessObject);

    gitFs.deleteFile(r, filepath);
    await resolveFile(r, filepath);
    dispatch(recalculateFileTree(r));
  };

  const handleChangeRepoName = async (name: string) => {
    const cleanedName = slugifyPath(name);
    const r: RepoAccessObject = { fileSystemType, repoName: cleanedName };
    await handleRenameCurrentRepo(r);

    resolveGitRepos(r);
  };
  const handlePull = async (req: PullType) => {
    try {
      if (canCommit) {
        await handleCommit({
          authorEmail: currentGitConfig.authorEmail,
          authorName: currentGitConfig.authorName,
          commitMessage: 'Saving staged files for a git pull',
        });
      }
      await pullRepo(req);
    } catch (error: any) {
      throw error;
    } finally {
      await resolveGitRepoStatus(undefined, true);
      await resolvePushStatus();
    }
  };

  const handlePushRepo = async (req: PushType) => {
    await pushRepo(req);
    await resolveGitRepoStatus();
    await resolvePushStatus();
  };

  const handleNavToFile = async (filePath: string) => {
    const r = getRepoAccess(repoAccessObject);
    dispatch(changeViewMode(ViewModeEnum.CodeEditor));
    const fileContent = await gitFs.getFileContent(r, filePath);
    if (fileContent) {
      dispatch(setFileContent(fileContent));
      dispatch(setSelectedFile(filePath));
      dispatch(setLastSelectedPath(filePath));
    }
  };

  const handleGetUniqueDirPath = async (
    r: RepoAccessObject,
    auDirPath: string,
    basePath: string,
  ) => {
    const repoPath = getRepoPath(r);

    return await createUniquePath({
      name: auDirPath,
      basePath,
      repoPath,
      isFile: false,
      fsInstance: gitFs,
    });
  };

  const handleGetUniqueFilePath = async (
    r: RepoAccessObject,
    slideTitle: string,
    currentAuDir: string,
    extension: string = '.md',
  ) => {
    const repoPath = getRepoPath(r);

    return await createUniquePath({
      name: slugifyPath(slideTitle),
      basePath: currentAuDir,
      repoPath,
      isFile: true,
      extension,
      fsInstance: gitFs,
    });
  };

  const handleCreateFile = async (
    filePath: string,
    isDir: boolean,
    data?: string | Uint8Array,
  ) => {
    const r = getRepoAccess(repoAccessObject);

    if (isDir) {
      await gitFs.createDir(r, filePath);
    } else {
      await gitFs.createFile(r, filePath, data || '');
      await resolveFile(r, filePath);
    }

    await dispatch(recalculateFileTree(r));
  };

  const handleGetFileContents = async (filePath: string) => {
    const r = getRepoAccess(repoAccessObject);

    return await gitFs.getFileContent(r, filePath);
  };

  const handleUpdateFile = async (filePath: string, data: string) => {
    const r = getRepoAccess(repoAccessObject);

    await gitFs.updateFile(r, filePath, data);
    await resolveFile(r, filePath);

    await dispatch(recalculateFileTree(r));
  };

  const handleDeleteFile = async (filePath: string, isDir: boolean) => {
    const r = getRepoAccess(repoAccessObject);

    if (isDir) {
      await gitFs.deleteDir(r, filePath);
      await resolveDir(r, filePath);
    } else {
      await gitFs.deleteFile(r, filePath);
      await resolveFile(r, filePath);
    }

    await dispatch(recalculateFileTree(r));
  };

  const handleCopyFile = async (src: string, dest: string) => {
    const r = getRepoAccess(repoAccessObject);

    await gitFs.copyToDir(r, src, dest);
    await resolveFile(r, dest);

    await dispatch(recalculateFileTree(r));
  };

  const handleRenameFile = async (oldPath: string, newName: string) => {
    const r = getRepoAccess(repoAccessObject);

    await gitFs.renameFileOrFolder(r, oldPath, newName);
    await resolveFile(r, newName);
    await resolveFile(r, oldPath);

    await dispatch(recalculateFileTree(r));
  };

  const handleResolveMerge = async () => {
    const r = getRepoAccess(repoAccessObject);

    if (!currentBranch) return;

    await gitOperator.completeMerge(
      r,
      currentGitConfig.authorName,
      currentGitConfig.authorEmail,
      currentBranch,
    );
    await resolveGitRepoStatus();
    await resolvePushStatus();
  };

  const handleStageFile = async (filepath: string) => {
    const r = getRepoAccess(repoAccessObject);

    await stageFile(filepath);
    await resolveFile(r, filepath);
  };

  const handleUnStageFile = async (filepath: string) => {
    const r = getRepoAccess(repoAccessObject);

    await unStageFile(filepath);
    await resolveFile(r, filepath);
  };

  const handleGitCommitReset = async (filepath: string) => {
    await gitCommitReset(filepath);
    await resolveGitRepoStatus();
    await resolvePushStatus();
  };

  const handleCommit = async (req: CreateCommitType) => {
    await commit(req);
    await resolveGitRepoStatus();
    await resolvePushStatus();
  };

  const handleGitStashChanges = async () => {
    const r = getRepoAccess(repoAccessObject);

    await stashChanges();
    await resolveGitRepoStatus();
    dispatch(recalculateFileTree(r));
  };

  const handleGitStashPopChanges = async () => {
    const r = getRepoAccess(repoAccessObject);

    const changedFiles = await stashPopChanges();
    await resolveGitRepoStatus(changedFiles);
    dispatch(recalculateFileTree(r));
  };

  const handleGitSetConfig = async (req: GitConfigType) => {
    const r = getRepoAccess(repoAccessObject);

    await setConfig(r, req);
    if (req.remoteRepoUrl) setIsRepoConnectedToRemote(true);
    await resolvePushStatus();
  };

  const handlePathExists = async (path: string) => {
    return await gitFs.dirExists(path);
  };

  const handleBlobImageFile = async (
    r: RepoAccessObject,
    filePath: string,
    fileType: string,
  ) => {
    return await gitFs.blobImageFile(r, filePath, fileType);
  };

  const handleGetFolderStructure = async (
    dir: string,
    getContents = false,
    zip: JSZip | null = null,
  ) => {
    try {
      const r = getRepoAccess(repoAccessObject);
      const repoPath = getRepoPath(r);
      return await gitFs.getFolderStructure(dir, repoPath, getContents, zip);
    } catch {
      return [];
    }
  };

  // This function creates an environment where the user can test changes without being connected to a remote git repo
  // It needs to not use the handle functions as most of those use the current repo variable set in redux,
  // instead this function expliciltly calls filesystem functions itself to get around having to wait for redux state
  const handleCreateSandBox = async () => {
    const r = { repoName: sandBoxName, fileSystemType };
    await gitOperator.initGitRepo(r);

    await createNewCourseInFs({
      r,
      fsInstance: gitFs,
      courseTitle: 'sandbox',
      coursePath: 'sandbox',
      courseAu: 'intro',
      courseDescription: 'A place to test CMI5 content',
      courseId: 'https://sandbox',
      baseSlideTitle: 'Slide 1',
      baseSlideContent: sandboxIntro,
    });

    await gitFs.copyGit(r);
    const modifiedFiles: ModifiedFile[] = await gitOperator.gitRepoStatus(r);

    await gitOperator.gitAddAllModified(r, modifiedFiles);
    // Commit the inital files that are added to make the sandbox course

    await gitOperator.gitCommit(
      r,
      'Initial commit',
      'admin@bylight.com',
      'Admin',
    );
    await configureNewCourse(r);
  };

  const configureNewCourse = async (r: RepoAccessObject) => {
    // Set the initial config for a user so they can make git operations in the sandbox such as stash
    await setConfig(r, {
      authorEmail:
        currentGitConfig.authorEmail ||
        currentAuth?.parsedUserToken?.email?.toLowerCase(),
      authorName:
        currentGitConfig.authorName || currentAuth?.parsedUserToken?.name,
      remoteRepoUrl: '',
    });

    await gitFs.writeModifiedFiles(r, []);

    dispatch(addRepo(r.repoName));
    dispatch(setCurrentRepo(r.repoName));
  };

  // This function creates an environment where the user can test changes without being connected to a remote git repo
  // It needs to not use the handle functions as most of those use the current repo variable set in redux,
  // instead this function expliciltly calls filesystem functions itself to get around having to wait for redux state
  const handleCreateLocalCourse = async (req: CreateLocalRepoType) => {
    const cleanedName = slugifyPath(req.repoDirName);

    const r: RepoAccessObject = { repoName: cleanedName, fileSystemType };
    try {
      await gitOperator.initGitRepo(r, req.repoBranch);

      await configureNewCourse(r);

      if (req.repoRemoteUrl) setIsRepoConnectedToRemote(true);
    } catch (error: any) {
      debugLogError('Error creating the local file system');
      throw error;
    }
  };

  const handleCheckoutBranch = async (branch: string) => {
    const r = getRepoAccess(repoAccessObject);

    if (!allBranches.includes(branch)) {
      return;
    }
    try {
      await gitOperator.gitCheckout(r, branch);
      dispatch(setCurrentBranch(branch));
    } catch (error: any) {
      console.error('Could not checkout branch ', branch);
      throw error;
    }
  };

  const resolveCurrentRepo = async () => {
    await resolveGitConfig();

    const r = getRepoAccess(repoAccessObject);
    dispatch(recalculateFileTree(r));

    // prevent a double copy at the same time due to use effect
    if (!isCopyingGit.current) {
      try {
        isCopyingGit.current = true;
        await gitFs.copyGit(r);
      } finally {
        isCopyingGit.current = false;
      }
    } else {
      return;
    }

    const branch = await gitOperator.getCurrentGitBranch(r);
    if (branch) {
      dispatch(setCurrentBranch(branch));
    } else {
      dispatch(setCurrentBranch(null));
    }
    const allBranches = await gitOperator.getAllGitBranches(r);
    if (allBranches) {
      dispatch(setAllBranches(allBranches));
    }

    await resolveGitRepoStatus();

    setIsGitLoaded(true);

    await resolveRemoteRepoStatus();

    await resolvePushStatus();
    await handleNavToDesigner();
  };

  const resolveGitRepos = async (r: RepoAccessObject | null) => {
    // The user will always have at least one file system to work in

    const currentRepos = await gitOperator.listRepos(fileSystemType);

    dispatch(setAvailableRepos(currentRepos));

    // if repo access object is null create the sandbox, otherwise we want to resolve the repo access object
    if (currentRepos.length < 1) {
      await handleCreateSandBox();
      return;
    }

    if (r) {
      await resolveCurrentRepo();
    } else {
      dispatch(setCurrentRepo(currentRepos[0]));
    }
  };

  // use effect to take care of auto selecting a course
  useEffect(() => {
    if (repoAccessObject && !currentCourse) {
      const hasLocalFsAccess =
        repoAccessObject.fileSystemType === fsType.localFileSystem &&
        localFileSystemLoaded;

      const hasBrowserAccess =
        repoAccessObject.fileSystemType === fsType.inBrowser &&
        browserFileSystemLoaded;

      if (hasBrowserAccess || hasLocalFsAccess) {
        try {
          handleAutoSelectCourse();
        } catch (error: any) {
          debugLogError(`Could not auto select course: ${error}`);
        }
      }
    }
  }, [
    repoAccessObject,
    currentCourse,
    localFileSystemLoaded,
    browserFileSystemLoaded,
    fileSystemType,
  ]);

  // this allows us to use an existing file system api handle without prompting the user again
  useEffect(() => {
    if (fileSystemType === fsType.localFileSystem) {
      handleLocalFileSystemAccess();
    }

    if (fileSystemType === fsType.inBrowser) {
      handleBrowserFileSystemAccess();
    }
  }, []);

  // Populate branches when current repo changes
  useEffect(() => {
    debugLog('resolveGitRepos for', repoAccessObject?.repoName);
    // We will need to wait until this is loaded
    if (fileSystemType === fsType.localFileSystem) {
      if (localFileSystemLoaded) {
        resolveGitRepos(repoAccessObject);
      }
    } else if (fileSystemType === fsType.inBrowser) {
      if (browserFileSystemLoaded) {
        resolveGitRepos(repoAccessObject);
      }
    }
  }, [
    repoAccessObject,
    localFileSystemLoaded,
    browserFileSystemLoaded,
    fileSystemType,
  ]);

  return (
    <GitContext.Provider
      value={{
        isElectron,
        isFsLoaded,
        isGitLoaded,
        isInMerge,
        isRepoConnectedToRemote,
        canStage,
        currentGitConfig,
        canCommit,
        canStash,
        canPop,
        canPush,
        unpushedCommits,
        gitRepoCommits,
        handleGetUniqueFilePath,
        handleGetUniqueDirPath,
        handlePathExists,
        handleBlobImageFile,
        handleGetFolderStructure,
        handleGitSetConfig,
        handleGitStashChanges,
        handleGitStashPopChanges,
        handleStageFile,
        handleCheckoutBranch,
        handleUnStageFile,
        handleRevertFile,
        handleCreateFile,
        handleUpdateFile,
        handleDeleteFile,
        handleGetFileContents,
        handleCopyFile,
        handleRenameFile,
        handleGitCommitReset,
        handlePushRepo,
        getLocalFileBlob,
        getLocalFileBlobUrl,
        syncCurrentCourseWithGit,
        handleLoadCourse,
        currentRepo,
        availableRepos,
        handleChangeFileSystem,
        handleChangeRepo,
        handleChangeRepoName,
        handleDeleteCurrentRepo,
        handleDeleteCourse,
        handleCloneRepo,
        handlePull,
        handleDownloadCmi5Zip,
        handleCommit,
        handleResolveMerge,
        handleAutoSelectCourse,
        handleStageAll,
        handleUnstageAll,
        availableCourses,
        currentCourse,
        handleCreateCourse,
        handleNavToDesigner,
        handleNavToGitView,
        modifiedFiles,
        stashFiles,
        resolvePCTEProjects,
        publishToPCTE,
        handleGetCourseData,
        directoryTree,
        handleRenameCourse,
        handleImportRepoZip,
        handleCreateLocalCourse,
        handleRemoveFile,
        handleGetDiff,
        numStaged,
        handleNavToFile,
      }}
    >
      {children}
    </GitContext.Provider>
  );
};
