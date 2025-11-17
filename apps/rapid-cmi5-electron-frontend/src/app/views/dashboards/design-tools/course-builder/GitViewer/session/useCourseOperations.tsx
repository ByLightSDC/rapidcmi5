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
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import {
  updateCourseData,
  setIsLessonMounted,
  updateDirtyDisplay,
  currentViewMode,
  courseOperations,
  resetCourseOperations,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';

import slug from 'slug';

import YAML from 'yaml';

import {
  AppDispatch,
  RootState,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/store';
import { ViewModeEnum } from '../../CourseBuilderTypes';
import {
  CourseAU,
  CourseData,
  KSATElement,
  Operation,
  RC5ScenarioContent,
  SlideType,
  SlideTypeEnum,
  TeamConsolesContent,
} from '@rangeos-nx/types/cmi5';
import { CreateCourseType } from '../../CourseBuilderApiTypes';
import {
  noRepoAvailable,
  courseNameInUseMessage,
  deleteCourseFailMessage,
  RC5_VERSION,
} from './constants';
import { GitFS, MAX_FS_SLUG_LENGTH } from '../utils/fileSystem';
import { warningModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { setModal } from '@rangeos-nx/ui/redux';
import {
  flattenFolders,
  generateCourseJson,
  getScenarioDirectives,
  rc5MetaFilename,
} from '@rangeos-nx/cmi5-build/common';
import {
  debugLog,
  debugLogError,
  defaultEmptySlide,
} from '@rangeos-nx/ui/branded';
import path, { basename, dirname, join, normalize } from 'path-browserify';
import JSZip from 'jszip';
import { getRepoPath } from '../utils/gitOperations';
import { getRepoAccess } from './GitContext';
import { getFileContent } from '../hooks/files';

export const useCourseOperations = (
  fsInstance: GitFS,
  repoAccessObject: RepoAccessObject | null,
) => {
  const { fileState, fileSystemType }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const courseOperationsSet = useSelector(courseOperations);
  const availableCourses = fileState?.availableCourses ?? [];
  const currentCourse = fileState.selectedCourse;

  const dispatch = useDispatch<AppDispatch>();
  const viewMode = useSelector(currentViewMode);

  const getFirstCoursePath = useCallback(
    async (r: RepoAccessObject) => {
      const courses = await findAllCourses(r);
      dispatch(setCourseList(courses));
      if (!courses || courses.length === 0) return null;
      return courses[0];
    },
    [dispatch],
  );

  const findCourse = useCallback(
    async (r: RepoAccessObject, coursePath: string) => {
      const courses = await findAllCourses(r);
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

    if (availableCourses.find((course) => course.basePath === courseName)) {
      throw Error(courseNameInUseMessage);
    }

    let course: Course;
    if (zipFile) {
      const arrayBuffer = await zipFile.arrayBuffer();

      const zip = await JSZip.loadAsync(arrayBuffer);

      await fsInstance.importCmi5CourseZip(
        zip,
        r,
        courseName,
        courseDescription,
        courseId,
      );

      const courseData = await getCourseData(r, courseName);

      course = {
        basePath: courseName,
        courseData: courseData,
      };
    } else {
      course = await createNewCourse(
        r,
        courseName,
        firstAuName,
        courseDescription,
        courseId,
      );
    }

    if (!course || !course.courseData) {
      throw Error('Course Data Could Not Be Created');
    }

    dispatch(selectCourse(course));
    dispatch(pushCourseList(course));
    dispatch(recalculateFileTree(r));

    //save lesson and reset block and au when a new course is created from designer
    if (viewMode === ViewModeEnum.Designer) {
      dispatch(updateCourseData(course.courseData));
      dispatch(setIsLessonMounted(false));
    }

    return true;
  };

  const setAllCourses = async (r: RepoAccessObject) => {
    const courses = await findAllCourses(r);
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
   *
   */
  const findAllCourses = async (r: RepoAccessObject): Promise<Course[]> => {
    const repoPath = getRepoPath(r);

    const folderStructure = await fsInstance.getFolderStructure(repoPath, repoPath);
    const flatFolder = flattenFolders(folderStructure);

    const rc5Nodes = flatFolder.filter((n) => n.name === rc5MetaFilename);

    const courses = await Promise.all(
      rc5Nodes.map(async (node) => {
        const rc5Meta = await readRC5Meta(r, node.id);
        if (!rc5Meta) return null;

        return {
          basePath: dirname(normalize(node.id)),
        } as Course;
      }),
    );

    return courses.filter((c): c is Course => c !== null);
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
    const repoPath = getRepoPath(r);
    const itemPath = `${repoPath}/${coursePath}`;
    try {
      const stat = await fsInstance.fs.promises.stat(itemPath);
      if (!stat.isDirectory()) return null;

      const folderStructure = await fsInstance.getFolderStructure(
        itemPath,
        repoPath,
        getContents,
      );

      const courseData = generateCourseJson(folderStructure);
      return courseData || null;
    } catch (error: any) {
      debugLogError(`Error getting course data: ${error}`);
      return null;
    }
  };

  /**
   * Parses the RC5.yaml file into a TS object
   *
   *
   * @param repoName - The name of the directory where the repo exists.
   * @param metaPath - The path to the RC5.yaml file
   *
   */
  const readRC5Meta = async (
    r: RepoAccessObject,
    metaPath: string,
  ): Promise<CourseData | null> => {
    try {
      const navContent = await getFileContent(r, join(metaPath));
      if (!navContent?.content) throw new Error('No content in metadata');

      return YAML.parse(navContent.content.toString()) as CourseData;
    } catch (err) {
      debugLogError(`Failed to parse YAML: ${err}`);
      return null;
    }
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
    const editableCourseData = structuredClone(course.courseData);

    const repoPath = getRepoPath(r);
    if (!editableCourseData) {
      debugLogError('Could not saturate file system, course data is null');
      return [];
    }

    let rc5Meta = await readRC5Meta(r, join(course.basePath, rc5MetaFilename));

    if (!rc5Meta) return [];

    const flatSlides = flattenSlides(editableCourseData);

    const courseOperationsList = Object.entries(courseOperationsSet).map(
      ([filepath, operation]) => ({
        filepath,
        operation,
      }),
    );

    // If there are no course operations, then we are not updating any files, only things such as ordering
    try {
      for (const { filepath, operation } of courseOperationsList) {
        const absPath = `${repoPath}/${filepath}`;

        const slide = flatSlides.find((s) => s.filepath === filepath);

        switch (operation) {
          case Operation.Delete:
            try {
              const stat = await fsInstance.fs.promises
                .stat(absPath)
                .catch(() => null);
              if (!stat) {
                debugLogError(`Path not found for deletion: ${filepath}`);
                continue;
              }

              if (stat.isDirectory()) {
                await fsInstance.deleteDir(r, filepath);
              } else {
                await fsInstance.deleteFile(r, filepath);
              }
            } catch (err) {
              debugLogError(`Failed to delete ${filepath}, ${err}`);
            }
            break;

          case Operation.Add:
          case Operation.Edit:
            if (!slide) {
              debugLogError(`No matching slide found for path: ${filepath}`);
              break;
            }

            try {
              const content = slide.content?.toString() || '';

              await fsInstance.createFile(r, filepath, content);
            } catch (err) {
              debugLogError(
                `Failed to handle ${operation} for ${filepath}, ${err}`,
              );
            }
            break;

          default:
            debugLogError(
              `Unknown operation type for ${filepath}: ${operation}`,
            );
        }
      }

      await updatePaths(editableCourseData, repoPath, fsInstance);
      // update the file system
      await fsInstance.updateFile(
        r,
        `${course.basePath}/${rc5MetaFilename}`,
        YAML.stringify(stripSlideContent(editableCourseData)),
      );
      // update our current coursedata in visual desginer
      dispatch(updateCourseData(editableCourseData));
      return [
        ...courseOperationsList.map((file) => file.filepath),
        `${course.basePath}/${rc5MetaFilename}`,
      ];
    } catch (err: any) {
      debugLogError(
        `Could not cocmpute from course object to directory structure, ${err}`,
      );
      return [];
    } finally {
      dispatch(resetCourseOperations());
    }
  };

  // Extract KSAT data from slide content
  const extractKsatsFromSlide = (slideContent: string): KSATElement[] => {
    try {
      // Look for JSON blocks in the slide content
      const jsonMatch = slideContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1];
        const parsed = JSON.parse(jsonContent);
        return parsed.ksats || [];
      }
    } catch (error) {
      console.warn('Failed to extract KSATs from slide content:', error);
    }
    return [];
  };

  // We do not want contents of files to be put into RC5.yaml
  const stripSlideContent = (course: CourseData): CourseData => ({
    ...course,
    blocks: course.blocks.map((block) => ({
      ...block,
      aus: block.aus.map((au) => {
        // Extract KSATs from all slides in this AU
        const allKsats: KSATElement[] = [];
        au.slides.forEach((slide) => {
          if (slide.content && typeof slide.content === 'string') {
            const slideKsats = extractKsatsFromSlide(slide.content);
            allKsats.push(...slideKsats);
          }
        });

        // Remove duplicates and map to structured format
        const uniqueKsats = [...new Set(allKsats)];

        return {
          ...au,
          slides: au.slides.map(({ content, ...rest }) => rest),
          ksats: uniqueKsats,
        };
      }),
    })),
  });

  /**
   * Creates a new CMI5 course structure in the virtual file system.
   * This includes creating the course directory, the AU subdirectory,
   * a base RC5.yaml metadata file, and an initial slide.
   *
   * @param repoName - The name of the repository (root directory) where the course should be created.
   * @param coursePath - The relative path within the repository where the course folder should be created.
   * @param courseAu - The name of the AU (Assignable Unit) folder to create inside the course.
   * @param courseDescription - A human-readable description of the course.
   * @param courseId - A unique identifier or URL for the course.
   * @param baseSlideTitle - The filename for the initial slide (defaults to "01_slide.md").
   * @param baseSlideContent - The initial content of the first slide (defaults to a predefined template).
   *
   * @returns A `Course` object containing metadata and parsed structure for the created course.
   *
   * @throws An error if directory or file creation fails.
   */

  const createNewCourse = async (
    r: RepoAccessObject,
    coursePath: string,
    courseAu: string,
    courseDescription: string,
    courseId: string,
    baseSlideTitle: string = '01 slide',
    baseSlideContent: string = defaultEmptySlide.content,
  ) => {
    try {
      await fsInstance.createDir(r, coursePath);

      const auDirPath = join(coursePath, courseAu);
      const sluggedFilename = slugifyPath(baseSlideTitle);
      const firstSlidePath = join(auDirPath, sluggedFilename + '.md');

      // Create the course meta file
      await fsInstance.createFile(
        r,
        join(coursePath, rc5MetaFilename),
        YAML.stringify({
          blocks: [
            {
              blockName: coursePath,
              aus: [
                {
                  auName: courseAu,
                  dirPath: auDirPath,
                  slides: [
                    {
                      slideTitle: baseSlideTitle,
                      type: SlideTypeEnum.Markdown,
                      filepath: firstSlidePath,
                    },
                  ],
                },
              ],
              blockDescription: '',
            },
          ],
          courseId,
          courseTitle: coursePath,
          courseDescription: courseDescription,
          rc5Version: RC5_VERSION,
        } as CourseData),
      );

      // Create the base slide title
      await fsInstance.createFile(r, firstSlidePath, baseSlideContent);

      const courseData = await getCourseData(r, coursePath);

      const course = {
        name: coursePath,
        basePath: coursePath,
        courseData: courseData,
      } as Course;

      return course;
    } catch (error: any) {
      debugLog('Could not create course');
      throw error;
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
    createNewCourse,
    handleRenameCourse,
    getFirstCoursePath,
  };
};

export interface CreateUniquePathOptions {
  name: string; // Desired base name (e.g., slide title or folder name)
  basePath: string; // The directory under which the path will be created
  repoPath: string; // The repository root directory name
  isFile?: boolean; // Whether the path refers to a file (default: true)
  extension?: string; // Optional file extension (default: '.md' if isFile is true)
  overWriteName?: string; // If provided, will return early if candidate matches this path
  fsInstance: GitFS; // Custom FS instance (default: gitFs)
}

/**
 * Generates a unique path (file or folder) under a given base path in a virtual file system.
 *
 * This function ensures there are no naming collisions in the specified repository.
 * If `overWriteName` matches the candidate name, that name is returned immediately.
 *
 * @param options - Configuration object containing path generation parameters
 * @returns A unique relative path string under the provided base path
 */
export const createUniquePath = async ({
  name,
  basePath,
  repoPath,
  isFile = true,
  extension = '.md',
  overWriteName,
  fsInstance,
}: CreateUniquePathOptions): Promise<string> => {
  let copyNumber = 0;

  while (true) {
    const suffix = copyNumber === 0 ? '' : `-${copyNumber}`;
    const candidate = isFile
      ? `${basePath}/${name}${suffix}${extension}`
      : `${basePath}/${name}${suffix}`;

    if (candidate === overWriteName) return candidate;

    const fullPath = `/${repoPath}/${candidate}`;
    const exists = await fsInstance.fs.promises
      .stat(fullPath)
      .catch(() => null);

    if (exists) {
      copyNumber++;
    } else {
      return candidate;
    }
  }
};

export function flattenSlides(courseData: CourseData): SlideType[] {
  const slides: SlideType[] = [];

  for (const block of courseData.blocks) {
    for (const au of block.aus) {
      slides.push(...au.slides);
    }
  }

  return slides;
}

export const slugifyPath = (path: string) => {
  return slug(path).slice(0, MAX_FS_SLUG_LENGTH);
};

/**
 * Updates the directory and file paths for all AUs and their slides in the course.
 *
 * @param courseData - The full course data object containing blocks, AUs, and slides.
 * @param currentRepo - The name of the current repository where the course is stored.
 *
 * @remarks
 * This function iterates through all blocks and AUs in the course and:
 * - Renames AU directories if their names (slugs) have changed.
 * - Renames slide files if their titles (slugs) have changed or if the AU directory was moved.
 * - Ensures all paths are unique and consistent within the repo.
 *
 * Useful when course data has been edited and you want to ensure the filesystem
 * reflects updated AU or slide titles.
 *
 * Uses `createUniquePath()` to avoid name collisions and `mvFile()` to perform moves.
 */
export async function updatePaths(
  courseData: CourseData,
  currentRepo: string,
  fsInstance: GitFS,
) {
  for (const block of courseData.blocks) {
    for (const au of block.aus) {
      await updateAUPath(au, currentRepo, fsInstance);
    }
  }
}

/**
 * Update paths based on whats in course file
 * @param au
 * @param repo
 * @param fsInstance
 */
export async function updateAUPath(
  au: CourseAU,
  repo: string,
  fsInstance: GitFS,
): Promise<void> {
  const baseFolder = dirname(au.dirPath);
  const auSlug = slugifyPath(au.auName);

  const newDirPath = await createUniquePath({
    name: auSlug,
    basePath: baseFolder,
    repoPath: repo,
    isFile: false,
    overWriteName: au.dirPath,
    fsInstance,
  });

  const oldDirPath = au.dirPath;

  const isPathChanged = newDirPath !== oldDirPath;
  if (isPathChanged) {
    await fsInstance.mvFile(repo, oldDirPath, newDirPath);
    au.dirPath = newDirPath;
  }

  //update indivisual & team scenarios at the root
  const response = await updateSlidePaths(au, repo, isPathChanged, fsInstance);

  au.rangeosScenarioName = response.firstScenario?.name;
  au.rangeosScenarioUUID = response.firstScenario?.uuid;
  au.promptClassId = response.firstScenario?.promptClass;

  au.teamSSOEnabled =
    response.firstTeamScenario?.uuid || response.firstTeamScenario?.name
      ? true
      : false;
}

export async function updateSlidePaths(
  au: CourseAU,
  repo: string,
  isAuPathChanged: boolean,
  fsInstance: GitFS,
): Promise<{
  firstScenario?: RC5ScenarioContent;
  firstTeamScenario?: TeamConsolesContent;
}> {
  let firstScenario: RC5ScenarioContent | undefined = undefined;
  let firstTeamScenario: TeamConsolesContent | undefined = undefined;

  for (const slide of au.slides) {
    const fileName = slugifyPath(slide.slideTitle);
    const expectedPath = join(au.dirPath, fileName + '.md');

    const currentPath = isAuPathChanged
      ? join(au.dirPath, basename(slide.filepath))
      : slide.filepath;

    const needsRename = slide.filepath !== expectedPath;

    if (needsRename) {
      const uniquePath = await createUniquePath({
        name: fileName,
        basePath: au.dirPath,
        repoPath: repo,
        isFile: true,
        extension: '.md',
        overWriteName: currentPath,
        fsInstance,
      });

      const isDifferentFile = currentPath !== uniquePath;

      if (isDifferentFile) {
        await fsInstance.mvFile(repo, currentPath, uniquePath);
      }

      slide.filepath = uniquePath;
    }

    if (typeof slide.content === 'string') {
      const individualTrainingScenarios = getScenarioDirectives(slide.content);
      const teamExerciseScenarios = getScenarioDirectives(
        slide.content,
        'consoles',
      );

      if (
        individualTrainingScenarios &&
        individualTrainingScenarios.length > 0
      ) {
        firstScenario = individualTrainingScenarios[0];
      }
      if (teamExerciseScenarios && teamExerciseScenarios.length > 0) {
        firstTeamScenario = teamExerciseScenarios[0] as TeamConsolesContent;
      }
    }
  }
  return { firstScenario, firstTeamScenario };
}
