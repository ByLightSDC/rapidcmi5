// These are used to separate the react / redux logic from the actual operations

import { Course, RepoAccessObject } from '../../../../redux/repoManagerReducer';

import YAML from 'yaml';
import {
  CourseAU,
  CourseData,
  KSATElement,
  Operation,
  RC5ScenarioContent,
  SlideType,
  SlideTypeEnum,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build-common';
import { courseNameInUseMessage, RC5_VERSION } from '../session/constants';
import { GitFS, MAX_FS_SLUG_LENGTH } from './fileSystem';
import {
  flattenFolders,
  generateCourseJson,
  getScenarioDirectives,
  rc5MetaFilename,
} from '@rapid-cmi5/cmi5-build-common';
import {
  debugLog,
  debugLogError,
  defaultCourseData,
  defaultEmptySlide,
} from '@rapid-cmi5/ui';
import { basename, dirname, join, normalize } from 'path-browserify';
import JSZip from 'jszip';
import { getRepoPath } from './gitOperations';
import slug from 'slug';

export interface FsContextOptions {
  r: RepoAccessObject;
  fsInstance: GitFS;
}

export interface GetCourseDataInFsOptions extends FsContextOptions {
  coursePath: string;
  getContents?: boolean;
}

/**
 * Returns a list of all courses present in a repo
 *
 * @param repoName - The name of the directory where the repo exists.
 * @param coursePath - The path to directory which contains the RC5.yaml file
 *
 */
export const getCourseDataInFs = async ({
  r,
  fsInstance,
  coursePath,
  getContents = true,
}: GetCourseDataInFsOptions): Promise<CourseData | null> => {
  const repoPath = getRepoPath(r);
  const itemPath = `${repoPath}/${coursePath}`;
  try {
    const stat = await fsInstance.fs.promises.stat(itemPath);
    if (!stat.isDirectory()) return null;

    const folderStructure = await fsInstance.getFolderStructure(
      itemPath,
      coursePath,
      getContents,
    );

    const courseData = generateCourseJson(folderStructure);
    return courseData || null;
  } catch (error: any) {
    debugLogError(`Error getting course data: ${error}`);
    return null;
  }
};

export interface CreateNewCourseInFsOptions extends FsContextOptions {
  coursePath: string;
  courseTitle: string;
  courseAu: string;
  courseDescription: string;
  courseId: string;

  baseSlideTitle?: string;
  baseSlideContent?: string;
}
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

export const createNewCourseInFs = async ({
  r,
  fsInstance,
  coursePath,
  courseTitle,
  courseAu,
  courseDescription,
  courseId,
  baseSlideTitle = '01 slide',
  baseSlideContent = defaultEmptySlide.content,
}: CreateNewCourseInFsOptions) => {
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
        courseTitle: courseTitle,
        courseDescription: courseDescription,
        rc5Version: RC5_VERSION,
      } as CourseData),
    );

    // Create the base slide title
    await fsInstance.createFile(r, firstSlidePath, baseSlideContent);

    const courseData = await getCourseDataInFs({ r, fsInstance, coursePath });

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

export interface CreateCourseInFsOptions extends FsContextOptions {
  availableCourses: Course[];
  courseTitle: string;
  zipFile?: File;
  courseDescription: string;
  courseId: string;
  courseAu: string;
}

export const createCourseInFs = async ({
  availableCourses,
  courseTitle,
  zipFile,
  fsInstance,
  r,
  courseDescription,
  courseId,
  courseAu,
}: CreateCourseInFsOptions) => {
  // Ensure this is a valid course name
  const coursePath = slugifyPath(courseTitle);

  if (availableCourses.find((course) => course.basePath === coursePath)) {
    throw Error(courseNameInUseMessage);
  }

  let course: Course;
  if (zipFile) {
    const arrayBuffer = await zipFile.arrayBuffer();

    const zip = await JSZip.loadAsync(arrayBuffer);

    await fsInstance.importCmi5CourseZip(
      zip,
      r,
      courseTitle,
      courseDescription,
      courseId,
    );

    const courseData = await getCourseDataInFs({ r, fsInstance, coursePath });

    course = {
      basePath: coursePath,
      courseData: courseData,
    };
  } else {
    course = await createNewCourseInFs({
      r,
      fsInstance,
      coursePath,
      courseTitle,
      courseAu,
      courseDescription,
      courseId,
    });
  }

  if (!course || !course.courseData) {
    throw Error('Course Data Could Not Be Created');
  }

  return course;
};

/**
 * Returns a list of all courses present in a repo
 *
 * @param repoName - The name of the directory where the repo exists.
 *
 */
export const findAllCourses = async ({
  r,
  fsInstance,
}: FsContextOptions): Promise<Course[]> => {
  const repoPath = getRepoPath(r);

  const folderStructure = await fsInstance.getFolderStructure(repoPath, '');
  const flatFolder = flattenFolders(folderStructure);

  const rc5Nodes = flatFolder.filter((n) => n.name === rc5MetaFilename);

  const courses = await Promise.all(
    rc5Nodes.map(async (node) => {
      const rc5Meta = await readRC5Meta(r, fsInstance, node.id);
      if (!rc5Meta) return null;

      return {
        basePath: dirname(normalize(node.id)),
      } as Course;
    }),
  );

  return courses.filter((c): c is Course => c !== null);
};

/**
 * Parses the RC5.yaml file into a TS object
 *
 *
 * @param repoName - The name of the directory where the repo exists.
 * @param metaPath - The path to the RC5.yaml file
 *
 */
export const readRC5Meta = async (
  r: RepoAccessObject,
  fsInstance: GitFS,

  metaPath: string,
): Promise<CourseData | null> => {
  try {
    const navContent = await fsInstance.getFileContent(r, join(metaPath));
    if (!navContent?.content) throw new Error('No content in metadata');

    return YAML.parse(navContent.content.toString()) as CourseData;
  } catch (err) {
    debugLogError(`Failed to parse YAML: ${err}`);
    return null;
  }
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
  changedFiles: string[],
) {
  for (const block of courseData.blocks) {
    for (const au of block.aus) {
      await updateAUPath(au, currentRepo, fsInstance, changedFiles);
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
  changedFiles: string[],
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
    changedFiles.push(oldDirPath);
    changedFiles.push(newDirPath);

    au.dirPath = newDirPath;
  }

  //update indivisual & team scenarios at the root
  const response = await updateSlidePaths(
    au,
    repo,
    isPathChanged,
    fsInstance,
    changedFiles,
  );

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
  changedFiles: string[],
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
        changedFiles.push(currentPath);
        changedFiles.push(uniquePath);
      }

      slide.filepath = uniquePath;
    }

    if (typeof slide.content === 'string') {
      let individualTrainingScenarios: RC5ScenarioContent[];
      try {
        individualTrainingScenarios = getScenarioDirectives(slide.content);
      } catch {
        individualTrainingScenarios = [];
      }

      let teamExerciseScenarios: TeamConsolesContent[];

      try {
        teamExerciseScenarios = getScenarioDirectives(
          slide.content,
          'consoles',
        ) as TeamConsolesContent[];
      } catch {
        teamExerciseScenarios = [];
      }

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

export interface CreateLessonOptions extends FsContextOptions {
  courseData: CourseData;
  blockIndex: number;
  auName: string;
  coursePath: string;
}

export const createLesson = async ({
  r,
  fsInstance,
  courseData,
  blockIndex,
  auName,
  coursePath,
}: CreateLessonOptions) => {
  if (blockIndex < 0 || blockIndex >= courseData.blocks.length) {
    throw new Error(`Invalid blockIndex ${blockIndex}`);
  }

  const repoPath = getRepoPath(r);

  const auSlug = slugifyPath(auName);

  const uniqueAuPath = await createUniquePath({
    name: auSlug,
    basePath: coursePath,
    repoPath,
    isFile: false,
    fsInstance,
  });

  const slideSlug = slugifyPath(defaultEmptySlide.slideTitle);
  const filepath = join(uniqueAuPath, `${slideSlug}.md`);

  const theNewLesson: CourseAU = {
    auName,
    dirPath: uniqueAuPath,
    slides: [
      {
        ...defaultEmptySlide,
        filepath,
      },
    ],
  };

  // Get original block
  const targetBlock = courseData.blocks[blockIndex];

  // Create a new aus array with the new lesson appended
  const updatedAus = [...targetBlock.aus, theNewLesson];

  // Create a new block with updated aus
  const updatedBlock = {
    ...targetBlock,
    aus: updatedAus,
  };

  // Create a new blocks array with the updated block at blockIndex
  const blocks = courseData.blocks.map((block, i) =>
    i === blockIndex ? updatedBlock : block,
  );

  // Return fully new courseData
  const newCourseData = {
    ...courseData,
    blocks,
  };
  return newCourseData;
};

export interface ComputeCourseJsonOptions extends FsContextOptions {
  course: Course;
  courseOperationsSet: Record<string, Operation>;
}

/**
 * Saturates the front end file system with data from a course.json file.
 * This generally happens on the switch between design view and code view.
 *
 *
 * @param repoName - The name of the directory where the repo exists.
 * @param course - The CourseData object which you wish to seed the file system from.
 *
 */
export const computeCourseFromJsonFs = async ({
  r,
  fsInstance,
  course,
  courseOperationsSet,
}: ComputeCourseJsonOptions): Promise<{
  changedFiles: string[];
  courseData: CourseData;
}> => {
  const editableCourseData = structuredClone(course.courseData);

  const repoPath = getRepoPath(r);
  if (!editableCourseData) {
    debugLogError('Could not saturate file system, course data is null');
    throw Error('Course Data is null');
  }

  let rc5Meta = await readRC5Meta(
    r,
    fsInstance,
    join(course.basePath, rc5MetaFilename),
  );

  if (!rc5Meta) throw Error('RC5 file is empty');
  const flatSlides = flattenSlides(editableCourseData);
  const changedFiles: string[] = [];

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
            changedFiles.push(filepath);
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
            changedFiles.push(filepath);
          } catch (err) {
            debugLogError(
              `Failed to handle ${operation} for ${filepath}, ${err}`,
            );
          }
          break;

        default:
          debugLogError(`Unknown operation type for ${filepath}: ${operation}`);
      }
    }
    await updatePaths(editableCourseData, repoPath, fsInstance, changedFiles);
    // update the file system
    await fsInstance.updateFile(
      r,
      `${course.basePath}/${rc5MetaFilename}`,
      YAML.stringify(stripSlideContent(editableCourseData)),
    );
    // update our current course data in visual designer
    // const changedFiles = [
    //   ...courseOperationsList.map((file) => file.filepath),
    //   `${course.basePath}/${rc5MetaFilename}`,
    // ];
    changedFiles.push(`${course.basePath}/${rc5MetaFilename}`);

    return {
      changedFiles: [...new Set(changedFiles)],
      courseData: editableCourseData,
    };
  } catch (err: any) {
    debugLogError(
      `Could not compute from course object to directory structure, ${err}`,
    );
    throw Error(err);
  }
};

export // We do not want contents of files to be put into RC5.yaml
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

      const auClean: CourseAU = {
        ...au,
        slides: au.slides.map(({ content, ...rest }) => {
          return { ...rest, content: '' };
        }),
        ksats: uniqueKsats,
      };
      return auClean;
    }),
  })),
});

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

export interface RenameCourseInFsOptions extends FsContextOptions {
  oldCoursePath: string;
  newCourseTitle: string;
}

/**
 * Renames a course directory and updates all internal paths in the course structure.
 * This includes:
 * - Renaming the course directory itself
 * - Updating all block paths
 * - Updating all AU directory paths
 * - Updating all slide file paths
 * - Updating the RC5.yaml metadata
 *
 * @param r - Repository access object
 * @param fsInstance - File system instance
 * @param oldCoursePath - Current course directory path
 * @param newCourseTitle - New title for the course (will be slugified)
 * @returns Updated Course object with new paths
 */
export const renameCourseInFs = async ({
  r,
  fsInstance,
  oldCoursePath,
  newCourseTitle,
}: RenameCourseInFsOptions): Promise<Course> => {
  const repoPath = getRepoPath(r);
  const cleanedCourseName = slugifyPath(newCourseTitle);

  // Read the existing course data
  const courseData = await getCourseDataInFs({
    r,
    fsInstance,
    coursePath: oldCoursePath,
    getContents: true,
  });

  if (!courseData) {
    throw new Error(`Course not found at path: ${oldCoursePath}`);
  }

  // If the name hasn't actually changed, just update the title
  if (oldCoursePath === cleanedCourseName) {
    courseData.courseTitle = newCourseTitle;
    await fsInstance.updateFile(
      r,
      `${oldCoursePath}/${rc5MetaFilename}`,
      YAML.stringify(stripSlideContent(courseData)),
    );

    return {
      basePath: oldCoursePath,
      courseData,
    };
  }

  // Update the course title in metadata
  courseData.courseTitle = newCourseTitle;

  // Update all block and AU paths in the course data
  for (const block of courseData.blocks) {
    // Update block name to use new course path
    block.blockName = cleanedCourseName;

    for (const au of block.aus) {
      // Get the AU's relative path within the old course
      const auRelativePath = basename(au.dirPath);

      // Build new AU path under new course name
      const newAuPath = join(cleanedCourseName, auRelativePath);
      au.dirPath = newAuPath;

      // Update all slide paths
      for (const slide of au.slides) {
        // Get the slide's filename
        const slideFilename = basename(slide.filepath);

        // Build new slide path under new AU path
        slide.filepath = join(newAuPath, slideFilename);
      }
    }
  }

  // Rename the course directory in the filesystem
  await fsInstance.mvFile(repoPath, oldCoursePath, cleanedCourseName);

  // Update the RC5.yaml with new paths and title
  await fsInstance.updateFile(
    r,
    `${cleanedCourseName}/${rc5MetaFilename}`,
    YAML.stringify(stripSlideContent(courseData)),
  );

  return {
    basePath: cleanedCourseName,
    courseData,
  };
};
