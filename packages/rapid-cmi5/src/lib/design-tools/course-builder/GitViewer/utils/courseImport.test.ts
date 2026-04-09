import JSZip from 'jszip';
import YAML from 'yaml';
import { CourseData, SlideTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { resolveCourseZipPaths, isExcludedAuFile, getRc5Content, updateCourseData } from './courseImport';


// ============================================================================
// Test Fixtures
// ============================================================================

const RC5_FILENAME = 'RC5.yaml';
const COMPILED_COURSE_PREFIX = 'compiled_course/blocks';

function makeCourseData(overrides: Partial<CourseData> = {}): CourseData {
  return {
    courseTitle: 'Original Course',
    courseId: 'https://example.com/original',
    courseDescription: 'Original description',
    rc5Version: '0.0.1',
    blocks: [
      {
        blockName: 'Original Course',
        aus: [
          {
            auName: 'Lesson 1',
            dirPath: 'OriginalCourse/au1',
            slides: [
              {
                type: SlideTypeEnum.Markdown,
                filepath: 'OriginalCourse/au1/lesson1.md',
                slideTitle: 'lesson1',
                content: '',
              },
            ],
          },
          {
            auName: 'Lesson 2',
            dirPath: 'OriginalCourse/au2',
            slides: [
              {
                type: SlideTypeEnum.Markdown,
                filepath: 'OriginalCourse/au2/lesson2.md',
                slideTitle: 'lesson2',
                content: '',
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

async function makeZipWithRc5(courseData: CourseData): Promise<JSZip> {
  const zip = new JSZip();
  const yamlContent = YAML.stringify(courseData);
  zip.file(
    `${COMPILED_COURSE_PREFIX}/OriginalCourse/${RC5_FILENAME}`,
    yamlContent,
  );
  return zip;
}

// ============================================================================
// resolveCourseZipPaths
// ============================================================================

describe('resolveCourseZipPaths', () => {
  it('returns null for paths outside the compiled course prefix', () => {
    expect(resolveCourseZipPaths('other/path/file.md', 'NewCourse')).toBeNull();
    expect(
      resolveCourseZipPaths('compiled_course/other/file.md', 'NewCourse'),
    ).toBeNull();
    expect(resolveCourseZipPaths('', 'NewCourse')).toBeNull();
  });

  it('maps a nested file path to the new course name', () => {
    const result = resolveCourseZipPaths(
      'compiled_course/blocks/OrigCourse/au1/lesson.md',
      'NewCourse',
    );

    expect(result).not.toBeNull();
    expect(result!.pathInZip).toBe('OrigCourse/au1/lesson.md');
    expect(result!.pathInRepo).toBe('NewCourse/au1/lesson.md');
  });

  it('maps a directory entry to the new course name', () => {
    const result = resolveCourseZipPaths(
      'compiled_course/blocks/OrigCourse/au1/',
      'NewCourse',
    );

    expect(result).not.toBeNull();
    expect(result!.pathInZip).toBe('OrigCourse/au1/');
    expect(result!.pathInRepo).toBe('NewCourse/au1/');
  });

  it('preserves deeply nested paths', () => {
    const result = resolveCourseZipPaths(
      'compiled_course/blocks/OrigCourse/au1/assets/img/photo.png',
      'NewCourse',
    );

    expect(result).not.toBeNull();
    expect(result!.pathInRepo).toBe('NewCourse/au1/assets/img/photo.png');
  });

  it('uses the new course name exactly as provided', () => {
    const result = resolveCourseZipPaths(
      'compiled_course/blocks/OldName/au1/file.md',
      'my-renamed-course',
    );

    expect(result!.pathInRepo.startsWith('my-renamed-course')).toBe(true);
  });

  it('preserves the original course name in pathInZip for AU dir matching', () => {
    const result = resolveCourseZipPaths(
      'compiled_course/blocks/OldName/au1/config.json',
      'NewName',
    );

    expect(result!.pathInZip).toBe('OldName/au1/config.json');
    expect(result!.pathInRepo).not.toContain('OldName');
  });
});

// ============================================================================
// isExcludedAuFile
// ============================================================================

describe('isExcludedAuFile', () => {
  const auDirPaths = ['OrigCourse/au1', 'OrigCourse/au2'];

  it('excludes config.json inside an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/au1/config.json', auDirPaths)).toBe(
      true,
    );
  });

  it('excludes cfg.json inside an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/au1/cfg.json', auDirPaths)).toBe(true);
  });

  it('excludes index.html inside an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/au2/index.html', auDirPaths)).toBe(
      true,
    );
  });

  it('excludes favicon.ico inside an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/au2/favicon.ico', auDirPaths)).toBe(
      true,
    );
  });

  it('does not exclude an excluded filename that is NOT in an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/config.json', auDirPaths)).toBe(false);
    expect(isExcludedAuFile('OrigCourse/au3/config.json', auDirPaths)).toBe(
      false,
    );
  });

  it('does not exclude regular course files inside an AU directory', () => {
    expect(isExcludedAuFile('OrigCourse/au1/lesson.md', auDirPaths)).toBe(
      false,
    );
    expect(isExcludedAuFile('OrigCourse/au1/RC5.yaml', auDirPaths)).toBe(false);
  });

  it('returns false when auDirPaths is empty', () => {
    expect(isExcludedAuFile('OrigCourse/au1/config.json', [])).toBe(false);
  });
});

// ============================================================================
// getRc5Content
// ============================================================================

describe('getRc5Content', () => {
  it('parses and returns course data from the zip', async () => {
    const courseData = makeCourseData();
    const zip = await makeZipWithRc5(courseData);

    const result = await getRc5Content(zip);

    expect(result.courseTitle).toBe('Original Course');
    expect(result.courseId).toBe('https://example.com/original');
    expect(result.rc5Version).toBe('0.0.1');
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].aus).toHaveLength(2);
  });

  it('throws when no RC5.yaml is found in the zip', async () => {
    const zip = new JSZip();
    zip.file('compiled_course/blocks/Course/other.md', 'content');

    await expect(getRc5Content(zip)).rejects.toThrow(
      'No RC5.yaml file was found in the uploaded zip file',
    );
  });

  it('finds RC5.yaml regardless of its location in the zip', async () => {
    const zip = new JSZip();
    const courseData = makeCourseData();
    zip.file(`some/nested/path/${RC5_FILENAME}`, YAML.stringify(courseData));

    const result = await getRc5Content(zip);
    expect(result.courseTitle).toBe('Original Course');
  });
});

// ============================================================================
// updateCourseData
// ============================================================================

describe('updateCourseData', () => {
  it('updates courseTitle, courseId, and courseDescription', async () => {
    const courseData = makeCourseData();

    const encoded = await updateCourseData(
      courseData,
      'New Title',
      'https://new-id.com',
      'New description',
    );

    const result: CourseData = YAML.parse(new TextDecoder().decode(encoded));
    expect(result.courseTitle).toBe('New Title');
    expect(result.courseId).toBe('https://new-id.com');
    expect(result.courseDescription).toBe('New description');
  });

  it('renames blockName to match the new course name', async () => {
    const courseData = makeCourseData();

    const encoded = await updateCourseData(
      courseData,
      'NewCourse',
      'id',
      'desc',
    );
    const result: CourseData = YAML.parse(new TextDecoder().decode(encoded));

    expect(result.blocks[0].blockName).toBe('NewCourse');
  });

  it('updates AU dirPaths to use the new course name', async () => {
    const courseData = makeCourseData();

    const encoded = await updateCourseData(
      courseData,
      'NewCourse',
      'id',
      'desc',
    );
    const result: CourseData = YAML.parse(new TextDecoder().decode(encoded));

    expect(result.blocks[0].aus[0].dirPath).toBe('NewCourse/au1');
    expect(result.blocks[0].aus[1].dirPath).toBe('NewCourse/au2');
  });

  it('updates slide filepaths to use the new AU dirPath', async () => {
    const courseData = makeCourseData();

    const encoded = await updateCourseData(
      courseData,
      'NewCourse',
      'id',
      'desc',
    );
    const result: CourseData = YAML.parse(new TextDecoder().decode(encoded));

    expect(result.blocks[0].aus[0].slides[0].filepath).toBe(
      'NewCourse/au1/lesson1.md',
    );
    expect(result.blocks[0].aus[1].slides[0].filepath).toBe(
      'NewCourse/au2/lesson2.md',
    );
  });

  it('returns an encoded buffer containing valid YAML', async () => {
    const courseData = makeCourseData();

    const encoded = await updateCourseData(
      courseData,
      'NewCourse',
      'id',
      'desc',
    );

    expect(encoded.byteLength).toBeGreaterThan(0);
    const decoded = new TextDecoder().decode(encoded);
    expect(() => YAML.parse(decoded)).not.toThrow();
  });

  it('handles multiple blocks correctly', async () => {
    const courseData = makeCourseData({
      blocks: [
        {
          blockName: 'Block A',
          aus: [
            {
              auName: 'AU 1',
              dirPath: 'OldCourse/block-a/au1',
              slides: [
                {
                  type: 'markdown' as any,
                  filepath: 'OldCourse/block-a/au1/slide.md',
                  content: '',
                  slideTitle: 'slide',
                },
              ],
            },
          ],
        },
        {
          blockName: 'Block B',
          aus: [
            {
              auName: 'AU 2',
              dirPath: 'OldCourse/block-b/au2',
              slides: [
                {
                  type: 'markdown' as any,
                  filepath: 'OldCourse/block-b/au2/slide.md',
                  content: '',
                  slideTitle: 'slide',
                },
              ],
            },
          ],
        },
      ],
    });

    const encoded = await updateCourseData(
      courseData,
      'NewCourse',
      'id',
      'desc',
    );
    const result: CourseData = YAML.parse(new TextDecoder().decode(encoded));

    expect(result.blocks[0].blockName).toBe('NewCourse');
    expect(result.blocks[1].blockName).toBe('NewCourse');
    expect(result.blocks[0].aus[0].dirPath).toBe('NewCourse/block-a/au1');
    expect(result.blocks[1].aus[0].dirPath).toBe('NewCourse/block-b/au2');
    expect(result.blocks[0].aus[0].slides[0].filepath).toBe(
      'NewCourse/block-a/au1/slide.md',
    );
    expect(result.blocks[1].aus[0].slides[0].filepath).toBe(
      'NewCourse/block-b/au2/slide.md',
    );
  });
});