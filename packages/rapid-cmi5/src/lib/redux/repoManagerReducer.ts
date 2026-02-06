import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { flattenTree, INode } from 'react-accessible-treeview';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { RootState } from './store';
import { getRepoPath } from '../design-tools/course-builder/GitViewer/utils/gitOperations';
import { CourseData } from '@rapid-cmi5/cmi5-build-common';
import { getFsInstance } from '../design-tools/course-builder/GitViewer/utils/gitFsInstance';
import { resetPersistance } from '@rapid-cmi5/ui';
import { Payload } from 'react-rough-notation/dist/RoughNotationGroup/types';
import { slugifyPath } from '../design-tools/course-builder/GitViewer/utils/useCourseOperationsUtils';

// this pair ensures we always know what file system type and what the repo name is
// when acting upon the file system
export type RepoAccessObject = {
  fileSystemType: fsType;
  repoName: string;
};
export interface Course {
  basePath: string;
  courseData: CourseData | null;
}
export interface FileState {
  directoryTree: INode<IFlatMetadata>[];
  selectedFile: string | null;
  clipBoard: string | null;
  selectedCourse: Course | null;
  availableCourses: Course[];

  fileContent: Uint8Array | string | null;
  fileType: string | null;
  currentWorkingDir: string;
  lastSelectedPath: string;
}

export enum LoadingState {
  loaded = 'Loaded',
  loadingRepo = 'Loading Repo',
  cloningRepo = 'Cloning Repo',
}

// the file system path for the particular mount type
export enum fsType {
  inBrowser = 'inBrowser',
  localFileSystem = 'localFileSystem',
}

// the human readable version of the file system presented to the user
export const fsTypeLabels: Record<fsType, string> = {
  [fsType.inBrowser]: 'In-Browser Storage',
  [fsType.localFileSystem]: 'Local File System',
};

export interface RepoState {
  repoAccessObject: RepoAccessObject | null;
  fileSystemType: fsType;
  currentBranch: string | null;
  allBranches: string[];
  availableRepos: string[];
  fileState: FileState;
  showSelectProjects: boolean;
  loadingState: LoadingState;
}

export const initFileState: FileState = {
  directoryTree: flattenTree({ name: '', id: 1, children: [] }),
  selectedFile: null,
  selectedCourse: null,
  fileContent: null,
  fileType: null,
  clipBoard: null,
  currentWorkingDir: '/',
  lastSelectedPath: '/',
  availableCourses: [],
};
export const initialState: RepoState = {
  repoAccessObject: null,
  currentBranch: null,
  allBranches: [],
  availableRepos: [],
  fileState: initFileState,
  fileSystemType: fsType.inBrowser,
  showSelectProjects: true,
  loadingState: LoadingState.loaded,
};

export const repoManagerSlice = createSlice({
  name: 'repoManager',
  initialState,
  reducers: {
    setAvailableRepos: (state, action: PayloadAction<string[]>) => {
      state.availableRepos = action.payload;
    },
    addRepo: (state, action: PayloadAction<string>) => {
      state.availableRepos.push(action.payload);
    },
    removeRepo: (state, action: PayloadAction<string>) => {
      state.availableRepos = state.availableRepos.filter(
        (repo) => repo !== action.payload,
      );
    },
    setLoadingState: (state, action: PayloadAction<LoadingState>) => {
      state.loadingState = action.payload;
    },
    setCurrentRepo: (state, action: PayloadAction<string | null>) => {
      const repoName = action.payload;
      state.fileState = initFileState;

      if (!repoName) {
        state.repoAccessObject = null;
        return;
      }
      if (state.repoAccessObject) {
        state.repoAccessObject.repoName = repoName;
      } else {
        state.repoAccessObject = {
          fileSystemType: state.fileSystemType,
          repoName,
        };
      }
    },
    setCurrentFileSystemType: (state, action: PayloadAction<fsType>) => {
      state.fileSystemType = action.payload;
      state.fileState = initFileState;
      state.repoAccessObject = null;
    },
    renameCurrentCourse: (state, action: PayloadAction<string>) => {
      const newName = action.payload;
      const selected = state.fileState.selectedCourse;

      if (!selected) return;

      const oldBasePath = selected.basePath;
      const cleanedCourseName = slugifyPath(newName);

      const courseIndex = state.fileState.availableCourses.findIndex(
        (c) => c.basePath === oldBasePath,
      );

      selected.basePath = cleanedCourseName;
      if (selected.courseData?.courseTitle) {
        selected.courseData.courseTitle = newName;
      }

      if (courseIndex !== -1) {
        state.fileState.availableCourses[courseIndex] = { ...selected };
      }
    },
    toggleShowProject: (state, action: PayloadAction<boolean>) => {
      state.showSelectProjects = action.payload;
    },
    pushCourseList: (state, action: PayloadAction<Course>) => {
      state.fileState.availableCourses.push(action.payload);
    },
    selectCourse: (state, action: PayloadAction<Course>) => {
      state.fileState.selectedCourse = action.payload;
    },
    unselectCourse: (state, action: PayloadAction<void>) => {
      state.fileState.selectedCourse = null;
    },
    setCourseList: (state, action: PayloadAction<Course[]>) => {
      state.fileState.availableCourses = action.payload;
    },
    setLastSelectedPath: (state, action: PayloadAction<string>) => {
      state.fileState.lastSelectedPath = action.payload;
    },
    setSelectedFile: (state, action: PayloadAction<string | null>) => {
      state.fileState.selectedFile = action.payload;
    },
    setClipBoard: (state, action: PayloadAction<string>) => {
      state.fileState.clipBoard = action.payload;
    },
    setCurrentWorkingDir: (state, action: PayloadAction<string>) => {
      state.fileState.currentWorkingDir = action.payload;
    },
    setCurrentBranch: (state, action: PayloadAction<string | null>) => {
      state.currentBranch = action.payload;
    },
    setAllBranches: (state, action: PayloadAction<string[]>) => {
      state.allBranches = action.payload;
    },
    setFileContent: (
      state,
      action: PayloadAction<{
        content: Uint8Array | string | null;
        type: string | null;
      }>,
    ) => {
      state.fileState.fileContent = action.payload.content;
      state.fileState.fileType = action.payload.type;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(recalculateFileTree.pending, (state, action) => {
        state.fileState.directoryTree = [
          { name: 'Root', id: '/', children: [], isBranch: true, parent: null },
        ];
      })
      .addCase(recalculateFileTree.fulfilled, (state, action) => {
        state.fileState.directoryTree = action.payload;
      })
      .addCase(recalculateFileTree.rejected, (state, action) => {
        state.fileState.directoryTree = [
          { name: 'Root', id: '/', children: [], isBranch: true, parent: null },
        ];
      });

    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    });
  },
});

export const recalculateFileTree = createAsyncThunk(
  'repoManager/recalculateFileTree',
  async (r: RepoAccessObject, { dispatch, getState, rejectWithValue }) => {
    try {
      const gitFs = getFsInstance();

      const state = getState() as RootState;
      const selectedFile = state.repoManager.fileState.selectedFile;

      const fileTree = await renderTree(r);
      // If we have a selected file we want to ensure it matches whats actually in the file if we do
      // a git pull, git stash, or git pop
      if (selectedFile) {
        const fileContent = await gitFs.getFileContent(r, selectedFile);
        if (fileContent) {
          dispatch(setFileContent(fileContent));
        } else {
          dispatch(setFileContent({ content: '', type: '' }));
          dispatch(setSelectedFile(null));
        }
      }

      return fileTree;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  },
);

const renderTree = async (r: RepoAccessObject) => {
  const repoPath = getRepoPath(r);
  const gitFs = getFsInstance();

  const treeData = await gitFs.getFolderStructure(repoPath, '');

  const dirRoot = {
    id: '/', // Use repo name as the ID
    name: '', // Display the repo name
    children: treeData, // Attach transformed tree data
    isBranch: true,
  };

  return flattenTree(dirRoot);
};

export const {
  setAvailableRepos,
  setCurrentBranch,
  setAllBranches,
  addRepo,
  removeRepo,
  setCurrentRepo,
  setSelectedFile,
  setClipBoard,
  setFileContent,
  setCurrentWorkingDir,
  setLastSelectedPath,
  pushCourseList,
  selectCourse,
  setCourseList,
  unselectCourse,
  renameCurrentCourse,
  setCurrentFileSystemType,
  toggleShowProject,
  setLoadingState,
} = repoManagerSlice.actions;

export default repoManagerSlice.reducer;
export const currentFsTypeSel = (state: RootState) =>
  state.repoManager.fileSystemType;
export const showSelectProjects = (state: RootState) =>
  state.repoManager.showSelectProjects;

export const currentRepoAccessObjectSel = (state: RootState) =>
  state.repoManager.repoAccessObject;
