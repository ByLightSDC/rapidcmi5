import { MDXEditorMethods } from '@mdxeditor/editor';

import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { Message, MessageType } from '../../course-builder/CourseBuilderTypes';
import { useDispatch, useSelector } from 'react-redux';

import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

import {
  createCourseModalId,
  downloadCmi5ZipModalId,
  saveCourseFileModalId,
  testInPlayerModalId,
  warningModalId,
} from '../modals/constants';
import { ILessonNode } from '../drawers/components/LessonTreeNode';
import {
  MoveOnCriteriaEnum,
  Operation,
  CourseAU,
  CourseData,
  SlideType,
} from '@rapid-cmi5/cmi5-build-common';
import {
  debugLog,
  debugLogError,
  setModal,
  validateYamlFrontmatter,
} from '@rapid-cmi5/ui';
import {
  currentCourse,
  currentSlideNum,
  courseDataCache,
  currentAu,
  currentBlock,
  updateBlockIndex,
  updateAuIndex,
  navigateSlide,
  updateDisplayText,
  addCourseOperation,
  removeCourseAu,
  updateDirtyDisplay,
  updateCourseData,
  updateCourseAuData,
  updateCourseSlideData,
  resetCourseOperations,
  saveSlideContent,
  setIsLessonMounted,
  changeViewMode,
} from '../../../redux/courseBuilderReducer';

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
  saveMarkdownToCurrentSlide: (markdown: string) => boolean;
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
  saveMarkdownToCurrentSlide: (markdown: string) => false,
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
    const blocks = courseData?.blocks;

    if (!blocks) {
      return [];
    }

    if (currentBlockIndex >= blocks.length) {
      dispatch(updateBlockIndex(0));
      return [];
    }
    if (!courseData || currentAuIndex < 0 || currentBlockIndex < 0) {
      return [];
    }

    const currentBlock = courseData.blocks[currentBlockIndex];
    const aus = currentBlock?.aus;

    if (!aus?.length) {
      return [];
    }

    const normAuIndex = Math.min(aus.length - 1, currentAuIndex);

    if (normAuIndex !== currentAuIndex) {
      dispatch(updateAuIndex(normAuIndex));
    }

    const currentAu = aus[normAuIndex];
    const slides = currentAu?.slides;

    if (!slides?.length) {
      return [];
    }

    const normSlideIndex = Math.max(
      0,
      Math.min(slides.length - 1, currentSlideIndex),
    );

    if (normSlideIndex !== currentSlideIndex) {
      dispatch(navigateSlide(normSlideIndex));
    }

    const currentSlide = slides[normSlideIndex];

    if (!currentSlide) {
      return [];
    }

    dispatch(updateDisplayText(currentSlide.content as string));

    return slides;
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

      const block = courseData?.blocks?.[currentBlockIndex];
      const lessons = block?.aus;

      if (!lessons) {
        debugLogError('Course block lessons not available for lesson deletion');
        return;
      }

      const lessonToDelete = lessons[lessonIndex];

      if (!lessonToDelete) {
        debugLogError('AU not found at lesson index');
        return;
      }

      if (lessons.length <= 1) {
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

      const nextAuIndex =
        lessonIndex <= currentAuIndex
          ? Math.max(0, currentAuIndex - 1)
          : currentAuIndex;

      dispatch(
        addCourseOperation({
          filepath: lessonToDelete.dirPath,
          operation: Operation.Delete,
        }),
      );

      dispatch(
        removeCourseAu({
          blockIndex: currentBlockIndex,
          lessonIndex,
        }),
      );

      dispatch(updateAuIndex(nextAuIndex));
      dispatch(updateDirtyDisplay({ reason: 'delete lesson' }));
    },
    [courseData, currentBlockIndex, currentAuIndex, dispatch],
  );

  const onChangeCourseName = useCallback(
    (newName: string) => {
      if (!newName) {
        return;
      }

      const newCourseData: CourseData = {
        ...courseData,
      };

      dispatch(updateCourseData(newCourseData));

      dispatch(updateDirtyDisplay({ reason: 'change course name' }));
      handleRenameCourse(newName, newCourseData);
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

      const originalAu = courseData.blocks[currentBlockIndex].aus[lessonIndex];
      if (!originalAu) {
        debugLogError('Course data or AU not available for lesson name change');
        return;
      }

      const au: CourseAU = {
        ...originalAu,
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

      const originalSlide =
        courseData.blocks[currentBlockIndex].aus[element.lesson].slides[
          element.slide
        ];
      if (!originalSlide) {
        debugLogError(
          'Course data or slide not available for slide name change',
        );
        return;
      }

      const slide = {
        ...originalSlide,
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
      // Validate YAML frontmatter before saving
      const validationResult = validateYamlFrontmatter(slideContent);

      if (!validationResult.isValid) {
        // Show error modal to user
        const errorMsg = validationResult.lineNumber
          ? `Cannot save slide: Invalid YAML frontmatter at line ${validationResult.lineNumber}\n\n${validationResult.details}`
          : `Cannot save slide: Invalid YAML frontmatter\n\n${validationResult.details}`;

        console.error('YAML validation error:', validationResult);

        dispatch(
          setModal({
            type: warningModalId,
            id: null,
            name: null,
            meta: {
              title: 'Invalid YAML Frontmatter',
              message: errorMsg,
            },
          }),
        );

        // Do NOT save - return early
        return;
      }

      // YAML is valid - proceed with save
      dispatch(
        saveSlideContent({
          position: currentSlideIndex,
          content: slideContent || '',
          skipShouldDirty: true,
        }),
      );
    }
  };

  const saveMarkdownToCurrentSlide = useCallback(
    (markdown: string) => {
      const validationResult = validateYamlFrontmatter(markdown);

      if (!validationResult.isValid) {
        const errorMsg = validationResult.lineNumber
          ? `Cannot save slide: Invalid YAML frontmatter at line ${validationResult.lineNumber}\n\n${validationResult.details}`
          : `Cannot save slide: Invalid YAML frontmatter\n\n${validationResult.details}`;

        console.error('YAML validation error:', validationResult);

        dispatch(
          setModal({
            type: warningModalId,
            id: null,
            name: null,
            meta: {
              title: 'Invalid YAML Frontmatter',
              message: errorMsg,
            },
          }),
        );
        return false;
      }

      dispatch(
        saveSlideContent({
          position: currentSlideIndex,
          content: markdown,
          skipShouldDirty: true,
        }),
      );
      dispatch(updateDisplayText(markdown));
      return true;
    },
    [currentSlideIndex, dispatch],
  );

  const containsUuid = (str: string): boolean => {
    const lastSegment = str.split('/').pop() ?? '';

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(lastSegment);
  };

  const generateNewCourseId = async () => {
    const uuid = crypto.randomUUID();
    const courseId = courseData?.courseId ?? '';
    const newCourseId = `${courseId}/${uuid}`;
    return newCourseId;
  };

  const onSaveCourseFile = useCallback(async () => {
    // correct old courses without uuid
    const newCourseData: CourseData = {
      ...courseData,
    };
    if (!containsUuid(courseData.courseId)) {
      newCourseData.courseId = await generateNewCourseId();
    }

    const changedFiles = await syncCurrentCourseWithGit(newCourseData);
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
          handleLoadCourse(message.meta.coursePath).catch((e) => {
            throw e;
          });
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
      case MessageType.testInPlayer:
        dispatch(
          setModal({
            type: testInPlayerModalId,
            id: null,
            name: null,
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
        saveMarkdownToCurrentSlide,
        getMarkdownData,
        sendMessage,
      }}
    >
      {children}
    </RC5Context.Provider>
  );
};
