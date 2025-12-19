import {
  CourseData,
  QuizContent,
  ScenarioContent,
  SlideType,
  SlideTypeEnum,
  CTFContent,
  JobeContent,
  Operation,
  CourseAU,
} from '@rapid-cmi5/cmi5-build/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import {
  debugLog,
  defaultCourseData,
  resetPersistance,
} from '@rapid-cmi5/ui/branded';
import { ViewModeEnum } from '../design-tools/course-builder/CourseBuilderTypes';

export interface Scenario {
    /**
     * 
     * @type {string}
     * @memberof Scenario
     */
    'uuid'?: string;
    /**
     * Date when the object was created.
     * @type {string}
     * @memberof Scenario
     */
    'dateCreated'?: string;
    /**
     * Date when the object was last edited.
     * @type {string}
     * @memberof Scenario
     */
    'dateEdited'?: string;
    /**
     * A user provided human readable description.
     * @type {string}
     * @memberof Scenario
     */
    'description'?: string;
    /**
     * A user provided human readable name.
     * @type {string}
     * @memberof Scenario
     */
    'name'?: string;
    /**
     * The author of the package.
     * @type {string}
     * @memberof Scenario
     */
    'author'?: string;
    /**
     * User provided metadata
     * @type {object}
     * @memberof Scenario
     */
    'metadata'?: object;
}
/**
 * Before user is connected to repo, they can play in slides sandbox
 * FUTURE we will allow them to apply stash to a new lesson
 */
export type CourseSandbox = {
  wasRepo: string | null;
  wasCoursePath?: string;
  wasBlockIndex: number;
  wasSlides?: SlideType[];
  wasAuIndex: number;
};

export type CourseBuilderState = {
  courseOperations: Record<string, Operation>;
  courseData: CourseData;
  currentRepo: string;
  currentCourse: string;
  currentSlideIndex: number;
  dirtyDisplay: number;
  dirtyReason: string;
  gitViewCurrentTab: number;
  isLessonMounted: boolean;
  courseSandbox?: CourseSandbox;
  sourceCourseData?: CourseData;
  scenario?: Partial<Scenario>;
  teamScenario?: Partial<Scenario>;
  displayData: string;
  slideDeckText: string;
  slides: SlideType[];
  version?: number;
  viewMode: ViewModeEnum;
  currentAuIndex: number;
  currentBlockIndex: number;
  currentAuPath?: string;
  expandedFileTreeNodes: { [key: string]: string[] };
  isFileExplorerExpanded: boolean;
  isFileTreeOpen: boolean;
  isRepoViewInit: boolean;
  isVersionControlExpanded: boolean;
  repoFolderChange: boolean;
  repoViewScrollTop: number;
  // The repo cache allows us to store current AU and slide per repo and course pair
  repoCache: RepoCache;
};

// Saves the state for various repos so you may swap between them easily.
// Uses the slide and AU paths instead of index, so that you may still return to the same slide or AU
// even if the slide order changes
export type AuCache = {
  currentBlockIndex: number;
  lastAuPath: string;
  lastSlidePath: string;
};

export type RepoCourseCache = {
  lastCourse: string;
  courses: {
    [courseName: string]: AuCache;
  };
};

export type RepoCache = {
  [repoName: string]: RepoCourseCache;
};

/** @constant
    @type {ProjectState}
    @default
*/
export const initialState: CourseBuilderState = {
  courseOperations: {},
  currentSlideIndex: 0,
  currentRepo: '',
  currentCourse: '',
  courseData: defaultCourseData,
  gitViewCurrentTab: 0,
  version: 0.1,
  dirtyDisplay: 0,
  dirtyReason: '',
  displayData: '',
  isLessonMounted: false,
  courseSandbox: undefined,
  scenario: undefined,
  teamScenario: undefined,
  slideDeckText: '',
  sourceCourseData: undefined,
  slides: [
    { slideTitle: '', content: '', type: SlideTypeEnum.Markdown, filepath: '' },
  ],
  viewMode: ViewModeEnum.Designer,
  currentAuIndex: 0,
  currentBlockIndex: 0,
  currentAuPath: '',
  repoCache: {},
  expandedFileTreeNodes: {},
  isFileExplorerExpanded: true,
  isFileTreeOpen: true,
  isRepoViewInit: false,
  isVersionControlExpanded: false,
  repoFolderChange: false,
  repoViewScrollTop: 0,
};

type tDirtyState = { reason?: string; counter?: number };

/**
 * Slice to persist redux states for anything occuring once range is selected in the UI
 */
export const courseBuilderSlice = createSlice({
  name: 'courseBuilder',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    }),
  reducers: {
    loadCourse: (state, action: PayloadAction<CourseData>) => {
      state.sourceCourseData = action.payload;
    },

    addCourseOperation: (
      state,
      action: PayloadAction<{ filepath: string; operation: Operation }>,
    ) => {
      const { filepath, operation } = action.payload;
      state.courseOperations[filepath] = operation;
    },
    resetCourseOperations: (state) => {
      state.courseOperations = {};
    },
    addASlide: (state, action: PayloadAction<SlideType>) => {
      const newSlide = {
        ...action.payload,
      } as SlideType;

      addSlideOperation(newSlide.filepath, state);

      const theSlides = [
        ...state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides,
      ];
      theSlides.push(newSlide);
      state.courseData.blocks[state.currentBlockIndex].aus[
        state.currentAuIndex
      ].slides = theSlides;
      state.currentSlideIndex = theSlides.length - 1;

      state.dirtyReason = 'add slide';
      state.dirtyDisplay += 1;
      updateLastSlidePath(state);
    },
    reorderSlide: (
      state,
      action: PayloadAction<{
        currentBlockIndex: number;
        currentAuIndex: number;
        newAuIndex: number;
        currentSlideIndex: number;
        newSlideIndex: number;
        currentSlideMarkdown?: string;
      }>,
    ) => {
      const {
        currentBlockIndex,
        newAuIndex,
        newSlideIndex,
        currentAuIndex,
        currentSlideIndex,
        currentSlideMarkdown,
      } = action.payload;

      if (currentAuIndex !== newAuIndex) return;

      const slides =
        state.courseData.blocks[currentBlockIndex].aus[currentAuIndex].slides;

      const [movedSlide] = slides.splice(currentSlideIndex, 1);
      slides.splice(newSlideIndex, 0, movedSlide);

      if (currentAuIndex !== state.currentAuIndex) return;

      const newCurrentSlideIndex = getReindexedPosition(
        state.currentSlideIndex,
        currentSlideIndex,
        newSlideIndex,
      );

      if (currentSlideMarkdown) {
        slides[newCurrentSlideIndex].content = currentSlideMarkdown;
      }

      state.currentSlideIndex = newCurrentSlideIndex;
    },
    reorderLesson: (
      state,
      action: PayloadAction<{
        currentBlockIndex: number;
        currentAuIndex: number;
        newAuIndex: number;
      }>,
    ) => {
      const { currentBlockIndex, newAuIndex, currentAuIndex } = action.payload;

      const aus = state.courseData.blocks[currentBlockIndex].aus;

      const [movedAu] = aus.splice(currentAuIndex, 1);
      aus.splice(newAuIndex, 0, movedAu);

      state.currentAuIndex = getReindexedPosition(
        state.currentAuIndex,
        currentAuIndex,
        newAuIndex,
      );
    },
    insertASlide: (
      state,
      action: PayloadAction<{ position: number; slide: SlideType }>,
    ) => {
      const newSlide = action.payload.slide;
      addSlideOperation(newSlide.filepath, state);

      const theSlides = [
        ...state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides,
      ];
      theSlides.splice(action.payload.position, 0, newSlide);
      state.courseData.blocks[state.currentBlockIndex].aus[
        state.currentAuIndex
      ].slides = theSlides;
      state.currentSlideIndex = Math.min(
        action.payload.position,
        theSlides.length - 1,
      );

      state.dirtyReason = 'insert slide';
      state.dirtyDisplay += 1;
      updateLastSlidePath(state);
    },
    deleteASlide: (state, action: PayloadAction<number>) => {
      const theSlides = [
        ...state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides,
      ];

      const slide =
        state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides[action.payload];
      deleteSlideOperation(slide.filepath, state);

      //remove scenario if slide with scenario is deleted
      const wasContent: string = theSlides[action.payload].content as string;
      if (wasContent.indexOf(':::scenario') >= 0) {
        //remove scenario from project
        state.scenario = undefined;
        state.courseData = {
          ...state.courseData,
          blocks: state.courseData.blocks.map((block, blockIndex) =>
            blockIndex === state.currentBlockIndex
              ? {
                  ...block,
                  aus: block.aus.map((au, auIndex) =>
                    auIndex === state.currentAuIndex
                      ? {
                          ...au,
                          rangeosScenarioName: undefined,
                          rangeosScenarioUUID: undefined,
                        }
                      : au,
                  ),
                }
              : block,
          ),
        };
      }
      debugLog('updateTeamScenario (delete slide)');
      if (wasContent.indexOf(':::consoles') >= 0) {
        //remove scenario from project
        state.teamScenario = undefined;
      }

      //remove
      theSlides.splice(action.payload, 1);
      state.courseData.blocks[state.currentBlockIndex].aus[
        state.currentAuIndex
      ].slides = theSlides;

      state.currentSlideIndex = Math.max(state.currentSlideIndex - 1, 0);
      state.dirtyReason = 'delete slide';
      state.dirtyDisplay += 1;
      updateLastSlidePath(state);
    },
    deleteSlide: (
      state,
      action: PayloadAction<{ lessonIndex: number; slideIndex: number }>,
    ) => {
      const { lessonIndex, slideIndex } = action.payload;
      const block = state.courseData.blocks[state.currentBlockIndex];
      const au = block.aus[lessonIndex];
      const slides = au.slides;
      const slide = slides[slideIndex];

      deleteSlideOperation(slide.filepath, state);

      //remove scenario if slide with scenario is deleted
      if (typeof slide.content === 'string') {
        if (slide.content.includes(':::scenario')) {
          // Clear global scenario state
          state.scenario = undefined;

          // Clear scenario fields directly on current AU
          const currentAU = block.aus[state.currentAuIndex];
          currentAU.rangeosScenarioName = undefined;
          currentAU.rangeosScenarioUUID = undefined;
        }
        if (slide.content.includes(':::consoles')) {
          // Clear global scenario state
          state.teamScenario = undefined;
        }
      }

      slides.splice(slideIndex, 1);

      state.currentSlideIndex = Math.max(state.currentSlideIndex - 1, 0);
      state.dirtyReason = 'delete slide';
      state.dirtyDisplay += 1;
      updateLastSlidePath(state);
    },
    navigateSlide: (state, action: PayloadAction<number>) => {
      state.currentSlideIndex = action.payload;
      updateLastSlidePath(state);
    },
    changeViewMode(state, action: PayloadAction<ViewModeEnum>) {
      state.viewMode = action.payload;
    },
    cacheSandbox: (state, action: PayloadAction<CourseSandbox | undefined>) => {
      state.courseSandbox = action.payload;
    },
    setGitViewCurrentTab: (state, action: PayloadAction<number>) => {
      state.gitViewCurrentTab = action.payload;
    },
    setIsLessonMounted: (state, action: PayloadAction<boolean>) => {
      state.isLessonMounted = action.payload;
    },
    updateASlide: (
      state,
      action: PayloadAction<{
        position: number;
        slide: SlideType;
      }>,
    ) => {
      const theSlides = [...state.slides];

      const editedSlide = {
        ...action.payload.slide,
      } as SlideType;

      editSlideOperation(editedSlide.filepath, state);

      if (theSlides.length > action.payload.position) {
        theSlides[action.payload.position] = editedSlide;
        state.slides = theSlides;
        state.dirtyReason = 'update slide';
        state.dirtyDisplay += 1;
      } else {
        console.log('no slide at that index');
      }
    },
    updateASlideContent: (
      state,
      action: PayloadAction<{
        position: number;
        content:
          | string
          | ScenarioContent
          | QuizContent
          | CTFContent
          | JobeContent;
        display?: string;
        skipShouldDirty?: boolean;
      }>,
    ) => {
      const theSlides = [...state.slides];

      const slideIndex = Math.min(
        action.payload.position,
        state.slides.length - 1,
      );
      theSlides[slideIndex].content = action.payload.content;
      theSlides[slideIndex].display = action.payload.display;
      state.slides = theSlides;
      if (!action.payload.skipShouldDirty) {
        state.dirtyReason = 'update slide content';
        state.dirtyDisplay += 1;
      }
    },
    saveSlideContent: (
      state,
      action: PayloadAction<{
        position: number;
        content: string;
        skipShouldDirty?: boolean;
      }>,
    ) => {
      const block = state.courseData.blocks[state.currentBlockIndex];
      if (!block) return;

      const au = block.aus[state.currentAuIndex];
      if (!au) return;

      const slide = au.slides[state.currentSlideIndex];
      if (!slide) return;

      slide.content = action.payload.content;

      // For now we are just assuming that the file was edited, this must be fixed in the future
      editSlideOperation(slide.filepath, state);
    },
    updateASlideTitle: (
      state,
      action: PayloadAction<{ position: number; title: string }>,
    ) => {
      const theSlides = [...state.slides];
      theSlides[action.payload.position].slideTitle = action.payload.title;

      const slide =
        state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides[action.payload.position];

      editSlideOperation(slide.filepath, state);

      state.slides = theSlides;
      state.dirtyReason = 'update slide title';
      state.dirtyDisplay += 1;
    },
    updateASlideType: (
      state,
      action: PayloadAction<{ position: number; type: SlideTypeEnum }>,
    ) => {
      const theSlides = [...state.slides];
      theSlides[action.payload.position].type = action.payload.type;

      const slide =
        state.courseData.blocks[state.currentBlockIndex].aus[
          state.currentAuIndex
        ].slides[action.payload.position];

      state.courseOperations[slide.filepath] = Operation.Edit;

      state.slides = theSlides;
      state.dirtyReason = 'update slide type';
      state.dirtyDisplay += 1;
    },
    updateCourseData: (state, action: PayloadAction<CourseData>) => {
      state.courseData = action.payload;
    },
    updateCourseSlideData: (
      state,
      action: PayloadAction<{
        blockIndex: number;
        lessonIndex: number;
        slideIndex: number;
        slide: SlideType;
      }>,
    ) => {
      const { blockIndex, lessonIndex, slideIndex, slide } = action.payload;
      editSlideOperation(slide.filepath, state);
      state.courseData.blocks[blockIndex].aus[lessonIndex].slides[slideIndex] =
        slide;
    },
    updateCourseAuData: (
      state,
      action: PayloadAction<{
        blockIndex: number;
        lessonIndex: number;
        au: CourseAU;
      }>,
    ) => {
      const { blockIndex, lessonIndex, au } = action.payload;
      state.courseData.blocks[blockIndex].aus[lessonIndex] = au;
    },
    removeCourseAu: (
      state,
      action: PayloadAction<{
        blockIndex: number;
        lessonIndex: number;
      }>,
    ) => {
      const { blockIndex, lessonIndex } = action.payload;

      state.courseData.blocks[blockIndex].aus.splice(lessonIndex, 1);
    },
    updateCurrentCourse: (state, action: PayloadAction<string>) => {
      state.currentCourse = action.payload;
    },
    updateDirtyDisplay: (state, action: PayloadAction<tDirtyState>) => {
      state.dirtyReason = action.payload.reason || '';
      if (typeof action.payload.counter === 'undefined') {
        state.dirtyDisplay += 1;
      } else {
        state.dirtyDisplay = action.payload.counter;
      }
    },
    updateExpandedFileTreeNodes: (
      state,
      action: PayloadAction<{ repoName: string; nodeList: string[] }>,
    ) => {
      // Extra safety measure due to upgrading with a redux cache that does not have the object
      if (state.expandedFileTreeNodes === undefined)
        state.expandedFileTreeNodes = {};

      state.expandedFileTreeNodes[action.payload.repoName] =
        action.payload.nodeList;
    },
    setIsFileExplorerExpanded: (state, action: PayloadAction<boolean>) => {
      state.isFileExplorerExpanded = action.payload;
    },
    setIsFileTreeOpen: (state, action: PayloadAction<boolean>) => {
      state.isFileTreeOpen = action.payload;
    },
    setIsRepoViewInit: (state, action: PayloadAction<boolean>) => {
      state.isRepoViewInit = action.payload;
    },
    setIsVersionControlExpanded: (state, action: PayloadAction<boolean>) => {
      state.isVersionControlExpanded = action.payload;
    },
    setRepoViewScrollTop: (state, action: PayloadAction<number>) => {
      state.repoViewScrollTop = action.payload;
    },
    toggleRepoFolderChange: (state, action: PayloadAction<boolean>) => {
      state.repoFolderChange = action.payload;
    },
    updateScenario: (
      state,
      action: PayloadAction<{
        scenario: Partial<Scenario> | undefined;
        shouldDirty?: boolean;
      }>,
    ) => {
      state.scenario = action.payload.scenario;
      state.courseData = {
        ...state.courseData,
        blocks: state.courseData.blocks.map((block, blockIndex) =>
          blockIndex === state.currentBlockIndex
            ? {
                ...block,
                aus: block.aus.map((au, auIndex) =>
                  auIndex === state.currentAuIndex
                    ? {
                        ...au,
                        rangeosScenarioName: state.scenario?.name,
                        rangeosScenarioUUID: state.scenario?.uuid,
                      }
                    : au,
                ),
              }
            : block,
        ),
      };
      if (action.payload.shouldDirty) {
        state.dirtyReason = 'scenario updated';
        state.dirtyDisplay += 1;
      }
    },
    updateTeamScenario: (
      state,
      action: PayloadAction<{
        scenario: Partial<Scenario> | undefined;
      }>,
    ) => {
      state.teamScenario = action.payload.scenario;
    },
    updateSlideDeck: (
      state,
      action: PayloadAction<{
        slides: SlideType[];
        shouldDirty?: boolean;
      }>,
    ) => {
      state.slides = action.payload.slides;
      if (action.payload.shouldDirty) {
        state.dirtyReason = 'slide deck updated';
        state.dirtyDisplay += 1;
      }
      //replaced entire deck
    },
    updateDisplayText: (state, action: PayloadAction<string>) => {
      state.displayData = action.payload;
    },
    updateSlideDeckText: (state, action: PayloadAction<string>) => {
      state.slideDeckText = action.payload;
    },
    saveSlideDeckText: (state, action: PayloadAction<string>) => {
      //debugLog('saveSlidesCache', action.payload);
      state.slideDeckText = action.payload;
    },
    updateAuAndSlideIndex: (state, action: PayloadAction<number[]>) => {
      if (action.payload.length === 2) {
        state.currentSlideIndex = action.payload[1];
        state.currentAuIndex = action.payload[0];
      }
      updateLastAuPath(state);
    },
    updateAuIndex: (state, action: PayloadAction<number>) => {
      state.currentSlideIndex = 0;
      state.currentAuIndex = action.payload;
      updateLastAuPath(state);
    },
    updateAuPath: (state, action: PayloadAction<string | undefined>) => {
      state.currentAuPath = action.payload;
    },
    updateBlockIndex: (state, action: PayloadAction<number>) => {
      state.currentBlockIndex = action.payload;
      if (state.currentRepo) {
        state.repoCache[state.currentRepo].courses[
          state.currentCourse
        ].currentBlockIndex = state.currentBlockIndex;
      }
    },
    handleRepoDeletion: (state, action: PayloadAction<string>) => {
      const deletedRepo = action.payload;

      const newRepoCache = { ...state.repoCache };
      delete newRepoCache[deletedRepo];

      return {
        ...initialState,
        viewMode: ViewModeEnum.GitEditor, // stay on git repo view
        repoCache: newRepoCache,
      };
    },

    /**
     * Initializes or restores the repo cache state when a user switches to a specific repo-course combination.
     *
     * This reducer:
     * - Sets `currentRepo` and `currentCourse`
     * - Checks if a `repoCache` entry exists for this repo and course
     *   - If found: restores `currentBlockIndex`, `currentAuIndex`, and `currentSlideIndex` using the last cached AU/slide paths
     *   - If not: sets the cache to default (first block, AU, and slide)
     * - Updates `repoCache` with the current selection paths
     *
     * @example
     * dispatch(handleCacheChange({ currentRepo: 'sandbox', currentCourse: 'intro' }));
     *
     * @param state - The current `CourseBuilderState`
     * @param action - An object containing `currentRepo` and `currentCourse`
     */
    handleCacheChange: (
      state,
      action: PayloadAction<{ currentRepo: string; currentCourse: string }>,
    ) => {
      const { currentRepo, currentCourse } = action.payload;
      state.currentRepo = currentRepo;
      state.currentCourse = currentCourse;

      // Ensure cache structure
      if (!state.repoCache) state.repoCache = {};
      if (!state.repoCache[currentRepo])
        state.repoCache[currentRepo] = {
          courses: {},
          lastCourse: currentCourse,
        };

      if (state.repoCache[currentRepo].courses[currentCourse]) {
        const auIndex = getAuIndexFromCache(state, currentRepo, currentCourse);
        state.repoCache[currentRepo].lastCourse = currentCourse;
        if (auIndex !== -1) {
          const blockIndex =
            state.repoCache[currentRepo].courses[currentCourse]
              .currentBlockIndex;

          const slideIndex = getSlideIndexFromCache(
            state,
            blockIndex,
            auIndex,
            currentRepo,
            currentCourse,
          );

          state.currentBlockIndex = blockIndex;
          state.currentAuIndex = auIndex;
          state.currentSlideIndex = slideIndex !== -1 ? slideIndex : 0;
        } else {
          setDefaultCache(state, currentRepo, currentCourse);
        }
      } else {
        setDefaultCache(state, currentRepo, currentCourse);
      }

      updateLastSlideAndAuPath(state);
    },
  },
});

function editSlideOperation(filepath: string, state: CourseBuilderState) {
  // Its still an add for a first time file
  if (state.courseOperations[filepath] !== Operation.Add) {
    state.courseOperations[filepath] = Operation.Edit;
  }
}
function deleteSlideOperation(filepath: string, state: CourseBuilderState) {
  if (state.courseOperations[filepath] === Operation.Add) {
    state.courseOperations[filepath] = Operation.Cancel;
  } else {
    state.courseOperations[filepath] = Operation.Delete;
  }
}
function addSlideOperation(filepath: string, state: CourseBuilderState) {
  state.courseOperations[filepath] = Operation.Add;
}

function getAuIndexFromCache(
  state: CourseBuilderState,
  repo: string,
  course: string,
): number {
  const lastAuPath = state.repoCache[repo].courses[course].lastAuPath;
  return state.courseData.blocks[state.currentBlockIndex].aus.findIndex(
    (au) => au?.dirPath === lastAuPath,
  );
}

function getSlideIndexFromCache(
  state: CourseBuilderState,
  blockIndex: number,
  auIndex: number,
  repo: string,
  course: string,
): number {
  const lastSlidePath = state.repoCache[repo].courses[course].lastSlidePath;
  return state.courseData.blocks[blockIndex].aus[auIndex].slides.findIndex(
    (slide) => slide.filepath === lastSlidePath,
  );
}

function setDefaultCache(
  state: CourseBuilderState,
  repo: string,
  course: string,
) {
  const firstSlide = state.courseData.blocks[0].aus[0]?.slides[0];
  const firstAu = state.courseData.blocks[0].aus[0];

  state.currentBlockIndex = 0;
  state.currentAuIndex = 0;
  state.currentSlideIndex = 0;

  state.repoCache[repo].courses[course] = {
    lastSlidePath: firstSlide.filepath,
    lastAuPath: firstAu.dirPath,
    currentBlockIndex: 0,
  };
}

function updateLastSlideAndAuPath(state: CourseBuilderState) {
  if (
    state.currentRepo &&
    state.repoCache[state.currentRepo] &&
    state.repoCache[state.currentRepo].courses[state.currentCourse]
  ) {
    const currentBlock = state.courseData.blocks[state.currentBlockIndex];
    const currentAu = currentBlock.aus[state.currentAuIndex];
    const currentSlide = currentAu?.slides[state.currentSlideIndex];

    state.repoCache[state.currentRepo].courses[state.currentCourse] = {
      ...state.repoCache[state.currentRepo].courses[state.currentCourse],
      lastSlidePath: currentSlide.filepath,
      lastAuPath: currentAu.dirPath,
    };
  }
}

function updateLastSlidePath(state: CourseBuilderState) {
  if (
    state.currentRepo &&
    state.repoCache[state.currentRepo] &&
    state.repoCache[state.currentRepo].courses[state.currentCourse]
  ) {
    const currentSlide =
      state.courseData.blocks[state.currentBlockIndex].aus[state.currentAuIndex]
        .slides[state.currentSlideIndex];

    state.repoCache[state.currentRepo].courses[
      state.currentCourse
    ].lastSlidePath = currentSlide.filepath;
  }
}

/**
 * Calculates the new index of an item after reordering in a list.
 *
 * @param currentIndex - The original index of the item being reindexed.
 * @param fromIndex - The index from which an item is being moved.
 * @param toIndex - The index to which the item is being moved.
 * @returns The new index for the item at `currentIndex` after the reordering.
 *
 * @remarks
 * This is used when reordering items (e.g. slides or lessons) in a list.
 * It determines how the position of your current slide or lesson changes due to the move.
 *
 */
function getReindexedPosition(
  currentIndex: number,
  fromIndex: number,
  toIndex: number,
): number {
  if (currentIndex === fromIndex) return toIndex;
  if (currentIndex > fromIndex && currentIndex <= toIndex)
    return currentIndex - 1;
  if (currentIndex < fromIndex && currentIndex >= toIndex)
    return currentIndex + 1;
  return currentIndex;
}

function updateLastAuPath(state: CourseBuilderState) {
  if (
    state.currentRepo &&
    state.repoCache[state.currentRepo] &&
    state.repoCache[state.currentRepo].courses[state.currentCourse]
  ) {
    const currentBlock = state.courseData.blocks[state.currentBlockIndex];
    const currentAu = currentBlock.aus[state.currentAuIndex];

    state.repoCache[state.currentRepo].courses[state.currentCourse].lastAuPath =
      currentAu.dirPath;
  }
}

// Export actions to dispatch from components
export const {
  resetCourseOperations,
  addCourseOperation,
  addASlide,
  cacheSandbox,
  changeViewMode,
  insertASlide,
  deleteASlide,
  deleteSlide,
  navigateSlide,
  saveSlideContent,
  setGitViewCurrentTab,
  setIsFileExplorerExpanded,
  setIsFileTreeOpen,
  setIsLessonMounted,
  setIsRepoViewInit,
  setIsVersionControlExpanded,
  setRepoViewScrollTop,
  toggleRepoFolderChange,
  updateASlide,
  reorderSlide,
  reorderLesson,
  updateASlideContent,
  updateASlideTitle,
  updateASlideType,
  updateAuAndSlideIndex,
  updateCourseData,
  updateCourseSlideData,
  updateCourseAuData,
  updateCurrentCourse,
  updateDisplayText,
  updateExpandedFileTreeNodes,
  updateScenario,
  updateTeamScenario,
  updateSlideDeck,
  updateDirtyDisplay,
  loadCourse,
  saveSlideDeckText,
  updateAuIndex,
  updateAuPath,
  updateBlockIndex,
  handleCacheChange,
  handleRepoDeletion,
  removeCourseAu,
} = courseBuilderSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// Ex.package is entry in store
export const currentSlideNum = (state: RootState) =>
  state.courseBuilder.currentSlideIndex;
export const courseOperations = (state: RootState) =>
  state.courseBuilder.courseOperations;
export const dirtyDisplay = (state: RootState) =>
  state.courseBuilder.dirtyDisplay;
export const gitViewCurrentTab = (state: RootState) =>
  state.courseBuilder.gitViewCurrentTab;
export const repoCache = (state: RootState) => state.courseBuilder.repoCache;
export const isLessonMounted = (state: RootState) =>
  state.courseBuilder.isLessonMounted;
export const scenario = (state: RootState) => state.courseBuilder.scenario;
export const teamScenario = (state: RootState) =>
  state.courseBuilder.teamScenario;
export const slideDeck = (state: RootState) => state.courseBuilder.slides;
export const slideDeckText = (state: RootState) =>
  state.courseBuilder.slideDeckText;
export const displayData: (state: RootState) => string = (state) =>
  state.courseBuilder.displayData; //TO BE REMOVED
export const courseDataCache = (state: RootState) =>
  state.courseBuilder.courseData;
export const currentViewMode = (state: RootState) =>
  state.courseBuilder.viewMode;
export const currentAu = (state: RootState) =>
  state.courseBuilder.currentAuIndex;
export const currentAuPath = (state: RootState) =>
  state.courseBuilder.currentAuPath;
export const currentBlock = (state: RootState) =>
  state.courseBuilder.currentBlockIndex;
export const currentCourse = (state: RootState) =>
  state.courseBuilder.currentCourse;
export const courseSandboxSel = (state: RootState) =>
  state.courseBuilder.courseSandbox;
export const expandedFileTreeNodes = (state: RootState) =>
  state.courseBuilder.expandedFileTreeNodes;
export const isFileExplorerExpanded = (state: RootState) =>
  state.courseBuilder.isFileExplorerExpanded;
export const isFileTreeOpen = (state: RootState) =>
  state.courseBuilder.isFileTreeOpen;
export const isRepoViewInit = (state: RootState) =>
  state.courseBuilder.isRepoViewInit;
export const isDisplayDirty = (state: RootState) =>
  state.courseBuilder.dirtyDisplay > 0 ? true : false;
export const isVersionControlExpanded = (state: RootState) =>
  state.courseBuilder.isVersionControlExpanded;
export const repoFolderChange = (state: RootState) =>
  state.courseBuilder.repoFolderChange;
export const repoViewScrollTop = (state: RootState) =>
  state.courseBuilder.repoViewScrollTop;
export default courseBuilderSlice.reducer;
