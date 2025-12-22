import {
  debugLog,
  debugLogError,
  defaultCourseData,
  defaultEmptySlide,
} from '@rapid-cmi5/ui';
import {
  addCourseOperation,
  courseDataCache,
  currentAu,
  currentBlock,
  currentSlideNum,
  handleCacheChange,
  isLessonMounted,
  reorderLesson,
  reorderSlide,
  Scenario,
  setIsLessonMounted,
  updateAuAndSlideIndex,
  updateAuIndex,
  updateAuPath,
  updateBlockIndex,
  updateCourseData,
  updateDirtyDisplay,
  updateScenario,
} from '../../../redux/courseBuilderReducer';
import { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { RC5Context } from '../contexts/RC5Context';
import { Operation } from '@rapid-cmi5/cmi5-build-common';
import { CreateLessonType } from '../../course-builder/CourseBuilderApiTypes';

import { currentRepoAccessObjectSel } from '../../../redux/repoManagerReducer';
import { createLesson } from '../../course-builder/GitViewer/utils/useCourseOperationsUtils';
import { getFsInstance } from '../../course-builder/GitViewer/utils/gitFsInstance';

/**
 * Hook for dealing with course data
 * @returns
 */
export const useCourseData = (shouldUseEffects?: boolean) => {
  const dispatch = useDispatch();
  const courseData = useSelector(courseDataCache);
  const currentAuIndex = useSelector(currentAu);
  const currentBlockIndex = useSelector(currentBlock);
  const currentSlideIndex = useSelector(currentSlideNum);
  const isLessonMountedSel = useSelector(isLessonMounted);

  const { currentCourse, syncCurrentCourseWithGit } = useContext(GitContext);

  const repoAccessObject = useSelector(currentRepoAccessObjectSel);

  const { lessonSlides, saveSlide, getMarkdownData } = useContext(RC5Context);
  const getAuName = useCallback(() => {
    if (currentAuIndex < 0) {
      debugLogError('Negative AU Index');
      return '';
    }
    if (courseData.blocks && currentBlockIndex < courseData.blocks.length) {
      if (
        courseData.blocks[currentBlockIndex]?.aus &&
        currentAuIndex < courseData.blocks[currentBlockIndex].aus.length &&
        courseData.blocks[currentBlockIndex].aus[currentAuIndex]
      ) {
        return courseData.blocks[currentBlockIndex].aus[currentAuIndex].auName;
      }
    }
    return '';
  }, [courseData.blocks, currentBlockIndex, currentAuIndex]);

  /**
   * rebuilds course json with latest slide deck
   */
  const getCoursePayload = useCallback(
    (shouldIgnoreDisplay?: boolean) => {
      return courseData;
    },
    [courseData],
  );

  /**
   * Updates courseData with new lesson
   * AND syncs with file system
   * @param req
   */
  const handleCreateLesson = async (req: CreateLessonType) => {
    // TODO lesson name must be unique
    if (!repoAccessObject) return;
    const fsInstance = getFsInstance();

    let blockIndex = courseData.blocks.findIndex(
      (block) => block.blockName === req.blockName,
    );

    const newCourseData = await createLesson({
      auName: req.auName,
      blockIndex: blockIndex,
      courseData: courseData,
      coursePath: req.coursePath,
      fsInstance: fsInstance,
      r: repoAccessObject,
    });

    if (!newCourseData) {
      throw Error('Could not create a new lesson');
    }

    dispatch(
      addCourseOperation({
        filepath: newCourseData?.blocks[0].aus[0].slides[0].filepath,
        operation: Operation.Add,
      }),
    );

    dispatch(updateCourseData(newCourseData));
    dispatch(updateAuIndex(newCourseData.blocks[blockIndex].aus.length - 1));
    dispatch(updateBlockIndex(blockIndex));
    dispatch(setIsLessonMounted(false));
    dispatch(updateDirtyDisplay({ reason: 'created lesson' }));
  };

  /**
   * Reorders an AU (Assignable Unit) within the current block by moving it from one index to another.
   *
   * This dispatches a `reorderLesson` action with the current block and AU indices, and marks
   * the display as dirty to reflect that changes have occurred. It is assumed the slide state is
   * saved beforehand if needed.
   *
   * @param currentAuIndex - The current index of the AU to move.
   * @param newAuIndex - The index to move the AU to.
   */
  const handleReorderLesson = useCallback(
    (currentAuIndex: number, newAuIndex: number) => {
      //before changing lesson, we should save the current slide data
      dispatch(
        reorderLesson({
          currentAuIndex,
          currentBlockIndex,
          newAuIndex,
        }),
      );
      dispatch(updateDirtyDisplay({ reason: 'aus reordered' }));
    },
    [courseData, dispatch, saveSlide],
  );

  /**
   * Reorders a slide from one position to another, potentially across AUs (Assignable Units),
   * while preserving the currently selected slide's content to avoid race conditions.
   *
   * If the currently selected slide is being moved, its latest markdown content is retrieved
   * via `getMarkdownData()` and included in the dispatch to ensure data is not lost.
   *
   * Also triggers a dirty state update for the UI to reflect that changes have been made.
   *
   * @param auIndex - Index of the AU the slide currently belongs to.
   * @param newAuIndex - Index of the AU the slide is being moved to.
   * @param slideIndex - Current index of the slide within its AU.
   * @param newSlideIndex - Desired index for the slide in the new AU.
   */
  const handleReorderSlide = useCallback(
    (
      auIndex: number,
      newAuIndex: number,
      slideIndex: number,
      newSlideIndex: number,
    ) => {
      //before changing lesson, we should save the current slide data

      // We need to save the current file we are on

      const currentSlideMarkdown = getMarkdownData();

      dispatch(
        reorderSlide({
          currentAuIndex: auIndex,
          currentBlockIndex,
          currentSlideIndex: slideIndex,
          newAuIndex,
          newSlideIndex,
          currentSlideMarkdown,
        }),
      );

      dispatch(updateDirtyDisplay({ reason: 'slides reordered' }));
    },
    [courseData, dispatch, getMarkdownData, currentSlideIndex],
  );

  /**
   *  Handle Selection
   * set indexes from block and lesson names
   * @param blockName
   * @param auName
   * @returns
   */
  const changeLesson = useCallback(
    (blockName: string, auName: string, slideIndex?: number) => {
      //before changing lesson, we should save the current slide data
      saveSlide();

      debugLog('changeLesson blockName= ', blockName);
      debugLog('auName= ', auName);
      if (!blockName || !auName) {
        debugLog('Could not change lesson, missing block or au name');

        return;
      }
      const blockIndex = courseData.blocks.findIndex(
        (block) => block.blockName === blockName,
      );
      debugLog('blockIndex', blockIndex);
      if (blockIndex) {
        console.log('missing', courseData);
      }
      if (courseData.blocks.length <= blockIndex) {
        console.error(`Block of index ${blockIndex} is invalid`);
        return;
      }

      const auIndex = courseData.blocks[blockIndex].aus.findIndex(
        (au) => au.auName === auName,
      );
      debugLog('auIndex', auIndex);
      if (courseData.blocks[blockIndex].aus.length <= auIndex) {
        console.error(`AU of index ${auIndex} is invalid`);
        return;
      }

      if (typeof slideIndex !== 'undefined') {
        dispatch(updateAuAndSlideIndex([auIndex, slideIndex]));
        // }
      } else {
        dispatch(updateAuIndex(auIndex));
      }
      dispatch(updateBlockIndex(blockIndex));
      dispatch(setIsLessonMounted(false));
      dispatch(updateDirtyDisplay({ counter: 0 }));
    },
    [courseData, dispatch, saveSlide],
  );

  /**
   *  reverts course data in redux to git FILES system
   */
  const discardLessonChanges = useCallback(() => {
    syncCurrentCourseWithGit(courseData);
  }, [courseData, syncCurrentCourseWithGit]);

  /**
   * For Course Builder Only
   * saves course data in redux to git FILES system
   */
  const saveLessonToFiles = useCallback(async () => {
    dispatch(updateDirtyDisplay({ counter: 0 }));
    //console.log('save with ', formData || courseData);
    //save course data to files
    await syncCurrentCourseWithGit(courseData);
  }, [courseData, dispatch, getCoursePayload, syncCurrentCourseWithGit]);

  /**
   * REFMounts course data when lesson changes (depends on lesson name, block name)
   * updates au path and scenario when lesson changes
   */
  useEffect(() => {
    if (!isLessonMountedSel) {
      const scenarioID =
        courseData.blocks[currentBlockIndex]?.aus?.[currentAuIndex]
          ?.rangeosScenarioUUID;
      const scenarioName =
        courseData.blocks[currentBlockIndex]?.aus?.[currentAuIndex]
          ?.rangeosScenarioName;

      if (scenarioID || scenarioName) {
        const scenario: Scenario = {
          uuid: scenarioID,
          name: scenarioName,
        };

        dispatch(updateScenario({ scenario }));
      } else {
        dispatch(updateScenario({ scenario: undefined }));
      }

      const auPath =
        courseData.blocks[currentBlockIndex]?.aus?.[currentAuIndex]?.dirPath;

      debugLog(`mount lesson path ${auPath}`);
      dispatch(updateAuPath(auPath));
      dispatch(setIsLessonMounted(true));
    }
  }, [
    isLessonMountedSel,
    courseData.blocks,
    currentAuIndex,
    currentBlockIndex,
    dispatch,
    shouldUseEffects,
  ]);

  //!!REVIEW
  // This use effect is what triggers the repo cache to run
  // it will either make an entry, use an entry, or clear an entry.
  // The user then will either return to the last AU and slide they were working,
  // or will be brought to the first AU and slide.
  useEffect(() => {
    if (repoAccessObject !== null && currentCourse && currentCourse?.basePath) {
      dispatch(
        handleCacheChange({
          currentRepo: repoAccessObject.repoName,
          currentCourse: currentCourse?.basePath,
        }),
      );
    }
  }, [repoAccessObject, currentCourse]);

  return {
    getAuName,
    handleCreateLesson,
    changeLesson,
    courseData,
    currentAuIndex,
    currentBlockIndex,
    discardLessonChanges,
    isLessonMounted: isLessonMountedSel,
    saveLessonToFiles,
    lessonSlides: lessonSlides || [],
    currentSlideIndex,
    saveSlide,
    handleReorderSlide,
    handleReorderLesson,
  };
};
