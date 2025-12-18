import { GitFS } from './fileSystem';

import { MAX_FS_SLUG_LENGTH } from './fileSystem';
import {
  CourseAU,
  CourseData,
  SlideTypeEnum,
} from '@rapid-cmi5/types/cmi5';
import {
  fsType,
  RepoAccessObject,
} from '../../../../redux/repoManagerReducer';
import { createNewFsInstance } from './gitFsInstance';
import {
  createUniquePath,
  slugifyPath,
  updateAUPath,
  updatePaths,
  updateSlidePaths,
} from './useCourseOperationsUtils';

import { vol } from 'memfs';
import { createFsFromVolume } from 'memfs';

const memfs = createFsFromVolume(vol);
describe('useCourseLoader utility functions', () => {
  let instance: GitFS;
  const r: RepoAccessObject = {
    fileSystemType: fsType.inBrowser,
    repoName: 'repo',
  };

  beforeEach(async () => {
    vol.reset();
    instance = createNewFsInstance(false);
    instance.fs = memfs;
    try {
      await instance.deleteRepo(r);
      console.log('Removing the old repo');
    } catch (error: any) {
      console.log(error);
    }
  });

  describe('createUniquePath', () => {
    it('returns path without suffix if file does not exist', async () => {
      const path = await createUniquePath({
        name: 'slide',
        basePath: 'unit1',
        repoPath: 'inBrowser/repo',
        fsInstance: instance,
      });
      expect(path).toBe('unit1/slide.md');
    });

    it('returns unique path with suffix if file exists', async () => {
      await instance.createFile(r, 'unit1/slide.md', 'existing content');
      const path = await createUniquePath({
        name: 'slide',
        basePath: 'unit1',
        repoPath: 'inBrowser/repo',
        fsInstance: instance,
      });
      expect(path).toBe('unit1/slide-1.md');
    });

    it('returns overwrite path immediately if matched', async () => {
      const overwrite = 'unit1/slide.md';
      const path = await createUniquePath({
        name: 'slide',
        basePath: 'unit1',
        repoPath: 'inBrowser/repo',
        isFile: true,
        extension: '.md',
        overWriteName: overwrite,
        fsInstance: instance,
      });
      expect(path).toBe(overwrite);
    });
  });

  describe('slugifyPath', () => {
    it('returns slug within max length', () => {
      const longName = 'a'.repeat(MAX_FS_SLUG_LENGTH + 20);
      const slug = slugifyPath(longName);
      expect(slug.length).toBeLessThanOrEqual(MAX_FS_SLUG_LENGTH);
    });

    it('produces deterministic slugs', () => {
      const slug1 = slugifyPath('Slide Title');
      const slug2 = slugifyPath('Slide Title');
      expect(slug1).toBe(slug2);
    });
  });

  describe('updateAUPath', () => {
    it('renames AU dir if slug changes', async () => {
      const courseName = 'unit1';
      const au: CourseAU = {
        auName: 'New AU Title',
        dirPath: `${courseName}/Old-AU-Title`,
        slides: [],
      };

      await updateAUPath(au, 'inBrowser/repo', instance);

      expect(au.dirPath).toContain(`${courseName}/new-au-title`);
    });

    it('does nothing if slug matches existing dirPath', async () => {
      const courseName = 'unit1';

      const au: CourseAU = {
        auName: 'My AU',
        dirPath: `${courseName}/my-au`,
        slides: [],
      };

      await updateAUPath(au, 'inBrowser/repo', instance);
      expect(au.dirPath).toEqual(`${courseName}/my-au`);
    });
  });

  describe('updateSlidePaths', () => {
    it('renames slide if filepath and expected path mismatch', async () => {
      const auDirPath = 'unit1/au-title';
      const au: CourseAU = {
        auName: 'AU Title',
        dirPath: auDirPath,
        slides: [
          {
            slideTitle: 'Slide One',
            filepath: `${auDirPath}/old-slide.md`,
            type: SlideTypeEnum.Markdown,
          },
        ],
      };

      await updateSlidePaths(au, 'inBrowser/repo', false, instance);

      expect(au.slides[0].filepath).toEqual(`${auDirPath}/slide-one.md`);
    });

    it('does not rename if file path already matches expected', async () => {
      const slug = slugifyPath('Slide One');
      const au: CourseAU = {
        auName: 'AU Title',
        dirPath: 'unit1/au-title',
        slides: [
          {
            slideTitle: 'Slide One',
            filepath: `unit1/au-title/${slug}.md`,
            type: SlideTypeEnum.Markdown,
          },
        ],
      };

      const mvSpy = jest.spyOn(instance, 'mvFile');

      await updateSlidePaths(au, 'inBrowser/repo', false, instance);

      expect(mvSpy).not.toHaveBeenCalled();
    });
  });

  describe('updatePaths', () => {
    const firstAuDirPath = 'unit1/old-au';
    const newFirstAuDirPath = 'unit1/intro-au';

    const secondAuDirPath = 'unit1/second-au';
    let data: CourseData;

    beforeEach(async () => {
      await instance.createFile(r, `${firstAuDirPath}/slide-1.md`, '');
      await instance.createFile(r, `${firstAuDirPath}/slide-2.md`, '');

      await instance.createFile(r, `${secondAuDirPath}/slide-1.md`, '');
      await instance.createFile(r, `${secondAuDirPath}/slide-2.md`, '');
      data = {
        blocks: [
          {
            aus: [
              {
                auName: 'Intro AU',
                dirPath: firstAuDirPath,
                slides: [
                  {
                    slideTitle: 'Slide 1',
                    filepath: `${firstAuDirPath}/slide-1.md`,
                    type: SlideTypeEnum.Markdown,
                  },
                  {
                    slideTitle: 'Slide 2',
                    filepath: `${firstAuDirPath}/slide-2.md`,
                    type: SlideTypeEnum.Markdown,
                  },
                ],
              },
              {
                auName: 'Second AU',
                dirPath: secondAuDirPath,
                slides: [
                  {
                    slideTitle: 'Slide 1',
                    filepath: `${secondAuDirPath}/slide-1.md`,
                    type: SlideTypeEnum.Markdown,
                  },
                  {
                    slideTitle: 'Slide 2',
                    filepath: `${secondAuDirPath}/slide-2.md`,
                    type: SlideTypeEnum.Markdown,
                  },
                ],
              },
            ],
            blockName: '',
          },
        ],
        courseTitle: '',
        courseId: '',
      };
    });

    it('does nothing if AU and slide paths already match slugs', async () => {
      const mvSpy = jest.spyOn(instance, 'mvFile');

      data.blocks[0].aus[0].auName = 'Intro AU';
      data.blocks[0].aus[0].dirPath = newFirstAuDirPath;
      data.blocks[0].aus[0].slides = [
        {
          slideTitle: 'Slide 1',
          filepath: `${newFirstAuDirPath}/slide-1.md`,
          type: SlideTypeEnum.Markdown,
        },
        {
          slideTitle: 'Slide 2',
          filepath: `${newFirstAuDirPath}/slide-2.md`,
          type: SlideTypeEnum.Markdown,
        },
      ];
      await updatePaths(data, '/inBrowser/repo', instance);
      expect(mvSpy).not.toHaveBeenCalled();
    });

    it('updates au path and file paths if au name changes', async () => {
      await updatePaths(data, '/inBrowser/repo', instance);
      expect(data.blocks[0].aus[0].dirPath).toEqual(newFirstAuDirPath);
      expect(data.blocks[0].aus[0].slides[0].filepath).toEqual(
        `${newFirstAuDirPath}/slide-1.md`,
      );
      expect(data.blocks[0].aus[0].slides[1].filepath).toEqual(
        `${newFirstAuDirPath}/slide-2.md`,
      );
      expect(data.blocks[0].aus[1].dirPath).toEqual(secondAuDirPath);
      expect(data.blocks[0].aus[1].slides[0].filepath).toEqual(
        `${secondAuDirPath}/slide-1.md`,
      );
      expect(data.blocks[0].aus[1].slides[1].filepath).toEqual(
        `${secondAuDirPath}/slide-2.md`,
      );
    });

    it('updates au path and file paths if au name and file name changes', async () => {
      await instance.createFile(r, `${firstAuDirPath}/slide-3.md`, '');

      data.blocks[0].aus[0].slides.push({
        slideTitle: 'new name slide',
        filepath: `${firstAuDirPath}/slide-3.md`,
        type: SlideTypeEnum.Markdown,
      });
      await updatePaths(data, 'inBrowser/repo', instance);
      expect(data.blocks[0].aus[0].dirPath).toEqual(newFirstAuDirPath);
      expect(data.blocks[0].aus[0].slides[2].filepath).toEqual(
        `${newFirstAuDirPath}/new-name-slide.md`,
      );
    });

    it('Properly names files with the same name', async () => {
      await instance.createFile(r, `${firstAuDirPath}/slide-3.md`, '');
      await instance.createFile(r, `${firstAuDirPath}/slide-4.md`, '');

      const mvSpy = jest.spyOn(instance, 'mvFile');
      data.blocks[0].aus[0].slides.push({
        slideTitle: 'new name slide',
        filepath: `${firstAuDirPath}/slide-3.md`,
        type: SlideTypeEnum.Markdown,
      });
      data.blocks[0].aus[0].slides.push({
        slideTitle: 'new name slide',
        filepath: `${firstAuDirPath}/slide-4.md`,
        type: SlideTypeEnum.Markdown,
      });
      await updatePaths(data, 'inBrowser/repo', instance);

      expect(data.blocks[0].aus[0].slides[2].filepath).toEqual(
        `${newFirstAuDirPath}/new-name-slide.md`,
      );
      expect(data.blocks[0].aus[0].slides[3].filepath).toEqual(
        `${newFirstAuDirPath}/new-name-slide-1.md`,
      );

      expect(mvSpy).toHaveBeenCalled();
      expect(mvSpy).toHaveBeenCalledWith(
        'inBrowser/repo',
        `${firstAuDirPath}`,
        `${newFirstAuDirPath}`,
      );
      expect(mvSpy).toHaveBeenCalledWith(
        'inBrowser/repo',
        `${newFirstAuDirPath}/slide-3.md`,
        `${newFirstAuDirPath}/new-name-slide.md`,
      );
      expect(mvSpy).toHaveBeenCalledWith(
        'inBrowser/repo',
        `${newFirstAuDirPath}/slide-4.md`,
        `${newFirstAuDirPath}/new-name-slide-1.md`,
      );
    });

    it('Properly names aus with the same name', async () => {
      const thirdAuDirPath = 'unit1/au-3';
      const mvSpy = jest.spyOn(instance, 'mvFile');

      await instance.createFile(r, `${thirdAuDirPath}/slide-1.md`, '');
      await instance.createFile(r, `${thirdAuDirPath}/slide-2.md`, '');

      data.blocks[0].aus.push({
        auName: 'Intro AU',
        dirPath: thirdAuDirPath,
        slides: [
          {
            slideTitle: 'Slide 1',
            filepath: `${thirdAuDirPath}/slide-1.md`,
            type: SlideTypeEnum.Markdown,
          },
          {
            slideTitle: 'Slide 2',
            filepath: `${thirdAuDirPath}/slide-2.md`,
            type: SlideTypeEnum.Markdown,
          },
        ],
      });
      await updatePaths(data, 'inBrowser/repo', instance);

      expect(data.blocks[0].aus[0].dirPath).toEqual(`${newFirstAuDirPath}`);
      expect(data.blocks[0].aus[2].dirPath).toEqual(`${newFirstAuDirPath}-1`);
      expect(mvSpy).toHaveBeenCalled();

      expect(mvSpy).toHaveBeenCalledWith(
        'inBrowser/repo',
        `${firstAuDirPath}`,
        `${newFirstAuDirPath}`,
      );
      expect(mvSpy).toHaveBeenCalledWith(
        'inBrowser/repo',
        `${thirdAuDirPath}`,
        `${newFirstAuDirPath}-1`,
      );
    });

    it('generates fallback slug if slide title is only symbols', async () => {
      const badTitle = '!!!@@@###';
      const auDirPath = 'unit1/bad-au';

      await instance.createFile(r, `${auDirPath}/empty.md`, '');
      data.blocks[0].aus[0] = {
        auName: 'Bad AU',
        dirPath: auDirPath,
        slides: [
          {
            slideTitle: badTitle,
            filepath: `${auDirPath}/empty.md`,
            type: SlideTypeEnum.Markdown,
          },
        ],
      };

      await updatePaths(data, 'inBrowser/repo', instance);

      expect(data.blocks[0].aus[0].slides[0].filepath).toMatch(/\.md$/);
    });
  });
});

