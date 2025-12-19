/* eslint-disable @typescript-eslint/no-empty-function */
import { MDXEditorMethods } from '@mdxeditor/editor';
import { debugLog, debugLogError } from '@rapid-cmi5/ui/branded';
import React, {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { Message, MessageType } from '../../course-builder/CourseBuilderTypes';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCourseOperation,
  changeViewMode,
  courseDataCache,
  currentAu,
  currentBlock,
  currentCourse,
  currentSlideNum,
  navigateSlide,
  removeCourseAu,
  resetCourseOperations,
  saveSlideContent,
  setIsLessonMounted,
  updateAuIndex,
  updateBlockIndex,
  updateCourseAuData,
  updateCourseData,
  updateCourseSlideData,
  updateDirtyDisplay,
  updateDisplayText,
} from '../../../redux/courseBuilderReducer';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { setModal } from '@rapid-cmi5/ui/branded';
import {
  CourseAU,
  MoveOnCriteriaEnum,
  Operation,
  SlideType,
} from '@rapid-cmi5/cmi5-build/common';

import {
  createCourseModalId,
  downloadCmi5ZipModalId,
  saveCourseFileModalId,
  warningModalId,
} from '../modals/constants';
import { ILessonNode } from '../drawers/components/LessonTreeNode';

interface tProviderProps {
  isEnabled?: boolean;
  children?: JSX.Element;
}

interface IRC5Context {
  isEnabled?: boolean;
  lessonSlides: SlideType[];
  addEditor: (ref: RefObject<MDXEditorMethods>) => void;
  removeEditor: () => void;
  changeCourseName: (newName: string) => void;
  changeLessonMoveOn: (
    moveOn: MoveOnCriteriaEnum,
    element: ILessonNode,
  ) => void;
  changeLessonName: (newName: string, element: ILessonNode) => void;
  changeSlideName: (newName: string, element: ILessonNode) => void;

  deleteLesson: (lessonIndex: number) => void;
  discardLessonChanges: () => void;
  saveCourseFile: () => Promise<string[]>;
  saveSlide: () => void;
  getMarkdownData: () => string | undefined;
  sendMessage: (message: Message) => void;
}

/**
 * Context for Building CMI5 Course
 * @see ICourseBuilderContext
 * @return {Context} React Context
 */
export const RC5Context = createContext<IRC5Context>({
  isEnabled: true,
  lessonSlides: [],
  addEditor: (editorRef: RefObject<MDXEditorMethods>) => {},
  removeEditor: () => {},
  changeCourseName: (newName: string) => {},
  changeLessonMoveOn: (moveOn: MoveOnCriteriaEnum, element: ILessonNode) => {},
  changeLessonName: (newName: string, element: ILessonNode) => {},
  changeSlideName: (newName: string, element: ILessonNode) => {},
  deleteLesson: (lessonIndex: number) => {},
  discardLessonChanges: () => {},
  saveCourseFile: async () => [],
  saveSlide: () => {},
  getMarkdownData: () => {
    return undefined;
  },
  sendMessage: (message: Message) => {},
});

// Project Context Provider
export const RC5ContextProvider: any = (props: tProviderProps) => {
  const { children, isEnabled = true } = props;
  const dispatch = useDispatch();
  const { handleLoadCourse, syncCurrentCourseWithGit, handleRenameCourse } =
    useContext(GitContext);
  const currentCourseName = useSelector(currentCourse);
  const currentSlideIndex = useSelector(currentSlideNum);
  const courseData = useSelector(courseDataCache);
  const currentAuIndex = useSelector(currentAu);
  const currentBlockIndex = useSelector(currentBlock);

  const editorRef = useRef<RefObject<MDXEditorMethods> | null>(null);

  const lessonSlides = useMemo(() => {
    //defensive
    if (
      !courseData ||
      !courseData.blocks ||
      currentBlockIndex > courseData.blocks.length - 1
    ) {
      if (
        courseData &&
        courseData.blocks &&
        currentBlockIndex > courseData.blocks.length - 1
      ) {
        dispatch(updateBlockIndex(0));
      }
      return [];
    }
    if (courseData && currentAuIndex >= 0 && currentBlockIndex >= 0) {
      const currentBlock = courseData.blocks[currentBlockIndex];
      if (!currentBlock || !currentBlock.aus || currentBlock.aus.length === 0) {
        return [];
      }

      const normAuIndex = Math.min(currentBlock.aus.length - 1, currentAuIndex);
      if (normAuIndex !== currentAuIndex) {
        dispatch(updateAuIndex(normAuIndex));
      }

      const currentAu = currentBlock.aus[normAuIndex];
      if (!currentAu || !currentAu.slides || currentAu.slides.length === 0) {
        return [];
      }

      const normSlideIndex = Math.min(
        currentAu.slides.length - 1,
        currentSlideIndex,
      );
      if (normSlideIndex !== currentSlideIndex) {
        dispatch(navigateSlide(normSlideIndex));
      }

      const currentSlide = currentAu.slides[normSlideIndex];
      if (!currentSlide) {
        return [];
      }

      const content = currentSlide.content as string;
      dispatch(updateDisplayText(content));
      return currentAu.slides;
    }

    return [];
  }, [
    courseData,
    currentAuIndex,
    currentBlockIndex,
    currentSlideIndex,
    dispatch,
  ]);

  const onAddEditor = (ref: RefObject<MDXEditorMethods>) => {
    editorRef.current = ref;
  };

  const onRemoveEditor = () => {
    editorRef.current = null;
  };

  const getMarkdownData = () => {
    return editorRef.current?.current?.getMarkdown();
  };

  const onDeleteLesson = useCallback(
    (lessonIndex: number) => {
      debugLog('onDeleteLesson', lessonIndex);

      if (
        !courseData ||
        !courseData.blocks ||
        !courseData.blocks[currentBlockIndex]
      ) {
        debugLogError('Course data not available for lesson deletion');
        return;
      }

      const block = courseData.blocks[currentBlockIndex];
      if (!block || !block.aus) {
        debugLogError('Block or aus not available for lesson deletion');
        return;
      }

      const au = block.aus[lessonIndex];
      if (!au) {
        debugLogError('AU not found at lesson index');
        return;
      }

      const lessonCount = block.aus.length;
      if (lessonCount <= 1) {
        dispatch(
          setModal({
            type: warningModalId,
            id: '',
            name: '',
            meta: {
              message: 'You MUST have at least one lesson in your course.',
              title: 'Error Deleting Lesson',
            },
          }),
        );
        return;
      }

      const currentAu = block.aus[currentAuIndex];
      if (!currentAu) {
        debugLogError('Current AU not found');
        return;
      }

      dispatch(
        addCourseOperation({
          filepath: au.dirPath,
          operation: Operation.Delete,
        }),
      );

      const newLessonIndex = block.aus.findIndex(
        (lesson) => lesson.dirPath === currentAu.dirPath,
      );

      dispatch(updateAuIndex(newLessonIndex));

      dispatch(
        removeCourseAu({
          blockIndex: currentBlockIndex,
          lessonIndex: lessonIndex,
        }),
      );
      dispatch(updateDirtyDisplay({ reason: 'delete lesson' }));
    },
    [courseData, currentBlockIndex, dispatch],
  );

  const onChangeCourseName = useCallback(
    (newName: string) => {
      if (!newName) {
        return;
      }
      const newCourseData = {
        ...courseData,
        courseTitle: newName,
      };
      dispatch(updateCourseData(newCourseData));

      dispatch(updateDirtyDisplay({ reason: 'change course name' }));
      handleRenameCourse(newName);
    },
    [courseData, dispatch],
  );

  const onChangeLessonMoveOn = useCallback(
    (moveOnCriteria: MoveOnCriteriaEnum, element: ILessonNode) => {
      if (element.id === undefined) {
        return;
      }
      const lessonIndex = element.id as number;

      const au: CourseAU = {
        ...courseData.blocks[currentBlockIndex].aus[lessonIndex],
        moveOnCriteria: moveOnCriteria,
      };

      dispatch(
        updateCourseAuData({
          au,
          blockIndex: currentBlockIndex,
          lessonIndex,
        }),
      );
      dispatch(
        updateDirtyDisplay({ reason: 'change lesson move on criteria' }),
      );
    },
    [courseData, currentBlockIndex, dispatch],
  );

  const onChangeLessonName = useCallback(
    (newName: string, element: ILessonNode) => {
      if (element.id === undefined) {
        return;
      }
      const lessonIndex = element.id as number;

      if (
        !courseData ||
        !courseData.blocks ||
        !courseData.blocks[currentBlockIndex] ||
        !courseData.blocks[currentBlockIndex].aus ||
        !courseData.blocks[currentBlockIndex].aus[lessonIndex]
      ) {
        debugLogError('Course data or AU not available for lesson name change');
        return;
      }

      const au: CourseAU = {
        ...courseData.blocks[currentBlockIndex].aus[lessonIndex],
        auName: newName,
      };

      dispatch(
        updateCourseAuData({
          au,
          blockIndex: currentBlockIndex,
          lessonIndex,
        }),
      );
      dispatch(updateDirtyDisplay({ reason: 'change lesson name' }));
    },
    [courseData, currentBlockIndex, dispatch],
  );

  const onChangeSlideName = useCallback(
    (newName: string, element: ILessonNode) => {
      if (element.lesson === undefined || element.slide === undefined) {
        return;
      }

      if (
        !courseData ||
        !courseData.blocks ||
        !courseData.blocks[currentBlockIndex] ||
        !courseData.blocks[currentBlockIndex].aus ||
        !courseData.blocks[currentBlockIndex].aus[element.lesson] ||
        !courseData.blocks[currentBlockIndex].aus[element.lesson].slides ||
        !courseData.blocks[currentBlockIndex].aus[element.lesson].slides[
          element.slide
        ]
      ) {
        debugLogError(
          'Course data or slide not available for slide name change',
        );
        return;
      }

      const slide = {
        ...courseData.blocks[currentBlockIndex].aus[element.lesson].slides[
          element.slide
        ],
        slideTitle: newName,
      };

      dispatch(
        updateCourseSlideData({
          blockIndex: currentBlockIndex,
          lessonIndex: element.lesson,
          slide,
          slideIndex: element.slide,
        }),
      );
      dispatch(updateDirtyDisplay({ reason: 'change slide name' }));
    },
    [courseData, currentBlockIndex, dispatch],
  );

  const onDiscardLessonChanges = useCallback(async () => {
    dispatch(resetCourseOperations());
    await handleLoadCourse(currentCourseName);
  }, [currentCourseName, handleLoadCourse]);

  /**
   * updates slide data in redux
   * @param slideContent
   */
  const onSaveSlide = () => {
    const slideContent = getMarkdownData();

    if (typeof slideContent !== 'undefined' && slideContent !== null) {
      dispatch(
        saveSlideContent({
          position: currentSlideIndex,
          content: slideContent || '',
          skipShouldDirty: true,
        }),
      );
    }
  };

  const onSaveCourseFile = useCallback(async () => {
    const changedFiles = await syncCurrentCourseWithGit(courseData);
    dispatch(updateDirtyDisplay({ counter: 0 }));
    return changedFiles;
  }, [courseData, dispatch, syncCurrentCourseWithGit]);

  //#region Message Bus
  /**
   * Message Bus for communicating between context and drawing canvas
   * @param {Message} message Sends message
   * @returns
   */
  const sendMessage = (message: Message) => {
    switch (message.type) {
      case MessageType.remountLesson:
        dispatch(setIsLessonMounted(false));
        break;
      case MessageType.changeCourse:
        if (message.meta.coursePath) {
          handleLoadCourse(message.meta.coursePath);
        }
        break;
      case MessageType.createCourse:
        dispatch(
          setModal({
            type: createCourseModalId,
            id: null,
            name: null,
            meta: {
              title: 'Create Course',
            },
          }),
        );
        break;
      case MessageType.downloadCourseZip:
        dispatch(
          setModal({
            type: downloadCmi5ZipModalId,
            id: null,
            name: null,
            meta: {
              title: 'Download Course Zip',
            },
          }),
        );
        break;
      case MessageType.navigate:
        if (message?.meta?.meta?.destination) {
          dispatch(changeViewMode(message.meta.meta.destination));
        }

        break;
      case MessageType.saveCourse:
        dispatch(
          setModal({
            type: saveCourseFileModalId,
            id: null,
            name: null,
            meta: {
              title: 'Save Course?',
              message: '',
            },
          }),
        );
    }
  };

  return (
    <RC5Context.Provider
      value={{
        isEnabled,
        lessonSlides,
        addEditor: onAddEditor,
        changeCourseName: onChangeCourseName,
        changeLessonMoveOn: onChangeLessonMoveOn,
        changeLessonName: onChangeLessonName,
        changeSlideName: onChangeSlideName,
        deleteLesson: onDeleteLesson,
        discardLessonChanges: onDiscardLessonChanges,
        removeEditor: onRemoveEditor,
        saveCourseFile: onSaveCourseFile,
        saveSlide: onSaveSlide,
        getMarkdownData,
        sendMessage,
      }}
    >
      {children}
    </RC5Context.Provider>
  );
};
