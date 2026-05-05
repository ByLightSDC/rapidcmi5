import {
  CourseData,
  RC5_VERSION,
  RC5_FILENAME,
  CourseAU,
} from '@rapid-cmi5/cmi5-build-common';

import YAML from 'yaml';
import { join } from 'path-browserify';
import slug from 'slug';

const MAX_FS_SLUG_LENGTH = 100;

export type CourseRepoAccessObject = {
  fileSystemType: string;
  repoName: string;
};

export interface CourseCreationFs {
  fs: {
    promises: {
      stat: (path: string) => Promise<unknown>;
    };
  };
  createDir: (r: CourseRepoAccessObject, dirPath: string) => Promise<void>;
  createFile: (
    r: CourseRepoAccessObject,
    filePath: string,
    content: string | Uint8Array,
  ) => Promise<void>;
  updateFile: (
    r: CourseRepoAccessObject,
    filePath: string,
    newContent: string | Uint8Array,
  ) => Promise<void>;
  listRepoRemotes?: (
    r: CourseRepoAccessObject,
  ) => Promise<{ remote: string; url: string }[]>;
  getCurrentGitBranch?: (r: CourseRepoAccessObject) => Promise<string | void>;
}

const getRepoPath = (r: CourseRepoAccessObject) =>
  `/${r.fileSystemType}/${r.repoName}`;

const slugifyPath = (path: string) => slug(path).slice(0, MAX_FS_SLUG_LENGTH);

const createUniquePath = async ({
  name,
  basePath,
  repoPath,
  fsInstance,
}: {
  name: string;
  basePath: string;
  repoPath: string;
  fsInstance: CourseCreationFs;
}) => {
  let copyNumber = 0;

  while (true) {
    const suffix = copyNumber === 0 ? '' : `-${copyNumber}`;
    const candidate = `${basePath}/${name}${suffix}`;
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

export const createNewCourseFS = async ({
  course,
  r,
  fsInstance,
}: {
  course: CourseData;
  r: CourseRepoAccessObject;
  fsInstance: CourseCreationFs;
}) => {
  const repoPath = getRepoPath(r);
  const courseSlug = slugifyPath(course.courseTitle);

  for (const block of course.blocks) {
    for (const au of block.aus) {
      const auSlug = slugifyPath(au.auName);

      const uniqueAuPath = await createUniquePath({
        name: auSlug,
        basePath: courseSlug,
        repoPath,
        fsInstance,
      });
      await fsInstance.createDir(r, uniqueAuPath);

      for (const slide of au.slides) {
        const slideSlug = slugifyPath(slide.slideTitle);
        const filepath = join(uniqueAuPath, `${slideSlug}.md`);
        await fsInstance.createFile(r, filepath, slide.content ?? '');
      }
    }
  }

  course.rc5Version = RC5_VERSION;

  const remotes = (await fsInstance.listRepoRemotes?.(r)) ?? [];
  const branch = await fsInstance.getCurrentGitBranch?.(r);

  course.remoteGitUrl = remotes.find((rem) => rem.remote === 'origin')?.url;

  course.gitBranch = branch ?? undefined;

  course.buildTime = new Date().toISOString();

  // update the file system
  await fsInstance.createFile(
    r,
    `${courseSlug}/${RC5_FILENAME}`,
    YAML.stringify(stripSlideContent(course)),
  );
};

// We do not want contents of files to be put into RC5.yaml
const stripSlideContent = (course: CourseData): CourseData => ({
  ...course,
  blocks: course.blocks.map((block) => ({
    ...block,
    aus: block.aus.map((au) => {
      // Remove duplicates and map to structured format

      const auClean: CourseAU = {
        ...au,
        slides: au.slides.map(({ content, ...rest }) => {
          return { ...rest, content: '' };
        }),
      };
      return auClean;
    }),
  })),
});
