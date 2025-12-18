// hooks/useCourseLoader.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCourseList,
  selectCourse,
  Course,
  RepoState,
  pushCourseList,
  recalculateFileTree,
  renameCurrentCourse,
  RepoAccessObject,
  FileState,
} from '../../../../redux/repoManagerReducer';
import {
  updateCourseData,
  setIsLessonMounted,
  updateDirtyDisplay,
  currentViewMode,
  courseOperations,
  resetCourseOperations,
} from '../../../../redux/courseBuilderReducer';

import slug from 'slug';

import YAML from 'yaml';

import { AppDispatch, RootState } from '../../../../redux/store';
import { ViewModeEnum } from '../../CourseBuilderTypes';
import { CourseData, KSATElement, Operation } from '@rapid-cmi5/types/cmi5';
import { CreateCourseType } from '../../CourseBuilderApiTypes';
import { courseNameInUseMessage, deleteCourseFailMessage } from './constants';
import { GitFS } from '../utils/fileSystem';
import { warningModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { setModal } from '@rapid-cmi5/ui/redux';
import { rc5MetaFilename } from '@rapid-cmi5/cmi5-build/common';
import { debugLog, debugLogError } from '@rapid-cmi5/ui/branded';
import { join } from 'path-browserify';
import { getRepoPath } from '../utils/gitOperations';
import { getRepoAccess } from './GitContext';
import {
  computeCourseFromJsonFs,
  createCourseInFs,
  findAllCourses,
  flattenSlides,
  getCourseDataInFs,
  readRC5Meta,
  updatePaths,
} from '../utils/useCourseOperationsUtils';

export const useCourseOperations = (
  fsInstance: GitFS,
  repoAccessObject: RepoAccessObject | null,
  fileState: FileState,
  courseOperationsSet: Record<string, Operation>,
) => {
  const availableCourses = fileState?.availableCourses ?? [];
  const currentCourse = fileState.selectedCourse;

  const dispatch = useDispatch<AppDispatch>();
  const viewMode = useSelector(currentViewMode);

  const getFirstCoursePath = useCallback(
    async (r: RepoAccessObject) => {
      const courses = await findAllCourses({ r, fsInstance });
      dispatch(setCourseList(courses));
      if (!courses || courses.length === 0) return null;
      return courses[0];
    },
    [dispatch],
  );

  const findCourse = useCallback(
    async (r: RepoAccessObject, coursePath: string) => {
      const courses = await findAllCourses({ r, fsInstance });
      dispatch(setCourseList(courses));

      if (!courses || courses.length === 0) return null;

      const course = courses.find((c) => c.basePath === coursePath);
      if (!course) return null;

      const courseData = await getCourseData(r, course.basePath);

      if (!courseData) return null;

      return { course, courseData };
    },
    [dispatch],
  );

  const handleLoadCourse = useCallback(
    async (coursePath: string) => {
      const r = getRepoAccess(repoAccessObject);

      try {
        const result = await findCourse(r, coursePath);

        if (!result) {
          debugLogError('Course not found or could not fetch course data');
          return;
        }

        const { course, courseData } = result;

        dispatch(
          selectCourse({
            courseData,
            basePath: course.basePath,
          }),
        );

        if (viewMode === ViewModeEnum.Designer) {
          dispatch(updateCourseData(courseData));
          dispatch(setIsLessonMounted(false));
          dispatch(updateDirtyDisplay({ counter: 0 }));
        }
      } catch (error: any) {
        throw Error(error);
      }
    },
    [repoAccessObject, dispatch, findCourse, viewMode],
  );

  const handleRenameCourse = async (newCourseName: string) => {
    if (availableCourses.find((course) => course.basePath === newCourseName)) {
      throw Error(courseNameInUseMessage);
    }

    dispatch(renameCurrentCourse(newCourseName));
  };

  const handleAutoSelectCourse = useCallback(async () => {
    const r = getRepoAccess(repoAccessObject);

    const firstCourse = await getFirstCoursePath(r);
    if (!firstCourse) {
      return;
    }

    await handleLoadCourse(firstCourse.basePath);
    dispatch(recalculateFileTree(r));
  }, [repoAccessObject, getFirstCoursePath, handleLoadCourse]);

  /**
   * Saves course
   * @param newCourseData
   * @returns
   */
  const syncCurrentCourseWithGit = async (
    newCourseData: CourseData,
  ): Promise<string[]> => {
    const r = getRepoAccess(repoAccessObject);
    if (currentCourse === null) {
      debugLog('Current course is null');
      return [];
    }

    // Reset code viewer to blank on switch
    const newCourse = {
      basePath: currentCourse.basePath,
      courseData: newCourseData,
    } as Course;

    const changedFiles = await computeCourseFromJson(r, newCourse);

    await dispatch(recalculateFileTree(r));
    return changedFiles;
  };

  const createCourse = async (req: CreateCourseType) => {
    const r = getRepoAccess(repoAccessObject);

    const { courseName, courseDescription, firstAuName, courseId, zipFile } =
      req;

    const course = await createCourseInFs({
      availableCourses,
      courseTitle: courseName,
      zipFile,
      fsInstance,
      r,
      courseDescription,
      courseId,
      courseAu: firstAuName,
    });

    dispatch(selectCourse(course));
    dispatch(pushCourseList(course));
    dispatch(recalculateFileTree(r));

    if (!course.courseData) {
      throw Error('Course Data Could Not Be Created');
    }

    //save lesson and reset block and au when a new course is created from designer
    if (viewMode === ViewModeEnum.Designer) {
      dispatch(updateCourseData(course.courseData));
      dispatch(setIsLessonMounted(false));
    }

    return course;
  };

  const setAllCourses = async (r: RepoAccessObject) => {
    const courses = await findAllCourses({ r, fsInstance });
    if (courses !== null) {
      dispatch(setCourseList(courses));
    }
  };

  const deleteCourse = async (r: RepoAccessObject, courseName: string) => {
    debugLog('delete course');

    if (availableCourses.length <= 1) {
      dispatch(
        setModal({
          type: warningModalId,
          id: '',
          name: '',
          meta: {
            message: 'You MUST have at least one course in your repo.',
            title: 'Error Deleting Course',
          },
        }),
      );
      return;
    }

    try {
      await fsInstance.deleteDir(r, courseName);

      if (currentCourse?.basePath === r.repoName) {
        await handleAutoSelectCourse();
      }
      dispatch(updateDirtyDisplay({ reason: 'delete course' }));
    } catch (error: any) {
      let errorMessage = deleteCourseFailMessage;
      if (error.data?.response) {
        errorMessage = error?.data?.response;
      } else if (error?.message) {
        errorMessage = error?.message;
      }
      throw Error(errorMessage + `@${r.repoName}`);
    }
  };

  /**
   * Returns a list of all courses present in a repo
   *
   * @param repoName - The name of the directory where the repo exists.
   * @param coursePath - The path to directory which contains the RC5.yaml file
   *
   */
  const getCourseData = async (
    r: RepoAccessObject,
    coursePath: string,
    getContents: boolean = true,
  ): Promise<CourseData | null> => {
    return await getCourseDataInFs({
      r,
      fsInstance,
      coursePath: coursePath,
      getContents,
    });
  };

  /**
   * Saturates the front end file system with data from a course.json file.
   * This generally happens on the switch between design view and code view.
   *
   *
   * @param repoName - The name of the directory where the repo exists.
   * @param course - The CourseData object which you wish to seed the file system from.
   *
   */
  const computeCourseFromJson = async (
    r: RepoAccessObject,
    course: Course,
  ): Promise<string[]> => {
    // If there are no course operations, then we are not updating any files, only things such as ordering
    try {
      const { changedFiles, courseData } = await computeCourseFromJsonFs({
        r,
        fsInstance,
        course,
        courseOperationsSet,
      });

      // update our current course data in visual designer
      dispatch(updateCourseData(courseData));
      return changedFiles;
    } catch (err: any) {
      debugLogError(
        `Could not compute from course object to directory structure, ${err}`,
      );
      return [];
    } finally {
      dispatch(resetCourseOperations());
    }
  };

  return {
    handleLoadCourse,
    syncCurrentCourseWithGit,
    createCourse,
    deleteCourse,
    handleAutoSelectCourse,
    getCourseData,
    setAllCourses,
    handleRenameCourse,
    getFirstCoursePath,
  };
};
