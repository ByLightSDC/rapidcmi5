import { vol } from 'memfs';
import { createFsFromVolume } from 'memfs';
import { GitOperations } from './gitOperations';
import { Operation } from '@rapid-cmi5/cmi5-build/common';
import { computeCourseFromJsonFs, createCourseInFs, createLesson, getCourseDataInFs, slugifyPath } from './useCourseOperationsUtils';
import { FileState, fsType, initFileState, RepoAccessObject } from 'libs/rapid-cmi5/src/lib/redux/repoManagerReducer';
import { GitFS } from './fileSystem';
import { createNewFsInstance } from './gitFsInstance';

// ============================================================================
// Test Fixtures and Types
// ============================================================================

export interface TestContext {
  instance: GitFS;
  r: RepoAccessObject;
  fileState: FileState;
  gitOps: GitOperations;
}

const memfs = createFsFromVolume(vol);

const DEFAULT_REPO: RepoAccessObject = {
  fileSystemType: fsType.inBrowser,
  repoName: 'repo',
};

// ============================================================================
// Setup and Teardown
// ============================================================================

async function setupTestContext(): Promise<TestContext> {
  vol.reset();
  
  const instance = createNewFsInstance(false);
  instance.fs = memfs;
  
  const r = { ...DEFAULT_REPO };
  
  const gitOps = new GitOperations(instance);
  await gitOps.initGitRepo(r, 'main');
  
  return {
    instance,
    r,
    fileState: { ...initFileState },
    gitOps,
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Creates a basic test course with default values
 */
export async function createTestCourse(
  ctx: TestContext,
  overrides?: {
    courseTitle?: string;
    courseId?: string;
    courseDescription?: string;
    courseAu?: string;
  }
) {
  const defaults = {
    courseTitle: 'test',
    courseId: 'https://test',
    courseDescription: 'test',
    courseAu: 'test',
  };

  const params = { ...defaults, ...overrides };

  return await createCourseInFs({
    availableCourses: ctx.fileState.availableCourses,
    courseTitle: params.courseTitle,
    fsInstance: ctx.instance,
    r: ctx.r,
    courseAu: params.courseAu,
    courseId: params.courseId,
    courseDescription: params.courseDescription,
  });
}

/**
 * Verifies basic course structure and metadata
 */
export async function verifyCourseStructure(
  ctx: TestContext,
  coursePath: string,
  expectedTitle: string
) {
  const courseData = await getCourseDataInFs({
    r: ctx.r,
    fsInstance: ctx.instance,
    coursePath,
    getContents: true,
  });

  expect(courseData).toBeTruthy();
  expect(courseData?.courseTitle).toBe(expectedTitle);
  expect(courseData?.blocks).toBeDefined();
  expect(Array.isArray(courseData?.blocks)).toBe(true);

  return courseData!;
}

/**
 * Creates a lesson and verifies it was added correctly
 */
export async function createAndVerifyLesson(
  ctx: TestContext,
  coursePath: string,
  courseData: any,
  lessonName: string,
  blockIndex: number = 0
) {
  const updatedCourseData = await createLesson({
    auName: lessonName,
    blockIndex,
    courseData,
    coursePath,
    fsInstance: ctx.instance,
    r: ctx.r,
  });

  expect(updatedCourseData).toBeTruthy();
  expect(updatedCourseData!.blocks[blockIndex].aus).toBeDefined();

  return updatedCourseData!;
}

/**
 * Syncs course changes to filesystem
 */
export async function syncCourseToFs(
  ctx: TestContext,
  coursePath: string,
  courseData: any,
  operations: Record<string, Operation>
) {
  await computeCourseFromJsonFs({
    course: { basePath: coursePath, courseData },
    courseOperationsSet: operations,
    fsInstance: ctx.instance,
    r: ctx.r,
  });

  return await getCourseDataInFs({
    r: ctx.r,
    fsInstance: ctx.instance,
    coursePath,
    getContents: true,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('Course Operations', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTestContext();
  });

  afterEach(async () => {
    // Optional: additional cleanup
    vol.reset();
  });

  // --------------------------------------------------------------------------
  // Course Creation Tests
  // --------------------------------------------------------------------------

  describe('Course Creation', () => {
    it('should create a basic course with valid parameters', async () => {
      const course = await createTestCourse(ctx);

      expect(course).toBeTruthy();
      expect(course.basePath).toBe('test');

      const courseData = await verifyCourseStructure(ctx, 'test', 'test');
      expect(courseData.courseId).toBe('https://test');
      expect(courseData.courseDescription).toBe('test');
    });

    it('should sanitize course names with invalid characters', async () => {
      const courseTitle = '$test new repo $';
      const expectedPath = slugifyPath(courseTitle);

      const course = await createTestCourse(ctx, { courseTitle });

      expect(course.basePath).toBe(expectedPath);
      expect(course.basePath).not.toContain('$');
      expect(course.basePath).not.toContain(' ');

      const courseData = await verifyCourseStructure(
        ctx,
        expectedPath,
        courseTitle
      );
      expect(courseData.courseTitle).toBe(courseTitle);
    });

    it('should handle course names with spaces', async () => {
      const courseTitle = 'My Test Course';
      const expectedPath = slugifyPath(courseTitle);

      const course = await createTestCourse(ctx, { courseTitle });

      expect(course.basePath).toBe(expectedPath);
      expect(course.basePath).toMatch(/^[a-z0-9-]+$/);
    });

    it('should handle very long course names', async () => {
      const courseTitle = 'A'.repeat(300);
      const course = await createTestCourse(ctx, { courseTitle });

      expect(course.basePath.length).toBeLessThanOrEqual(255);
      await verifyCourseStructure(ctx, course.basePath, courseTitle);
    });

    it('should handle unicode characters in course names', async () => {
      const courseTitle = 'Test Course 测试 🚀';
      const course = await createTestCourse(ctx, { courseTitle });

      expect(course.basePath).toBeTruthy();
      const courseData = await verifyCourseStructure(
        ctx,
        course.basePath,
        courseTitle
      );
      expect(courseData.courseTitle).toBe(courseTitle);
    });
  });

  // --------------------------------------------------------------------------
  // Lesson Management Tests
  // --------------------------------------------------------------------------

  describe('Lesson Management', () => {
    it('should add a single lesson to a course', async () => {
      const course = await createTestCourse(ctx);
      const courseData = await verifyCourseStructure(ctx, course.basePath, 'test');

      const initialLessonCount = courseData.blocks[0].aus.length;

      const updatedCourseData = await createAndVerifyLesson(
        ctx,
        course.basePath,
        courseData,
        'New Lesson'
      );

      expect(updatedCourseData.blocks[0].aus.length).toBe(initialLessonCount + 1);
      expect(updatedCourseData.blocks[0].aus[initialLessonCount].auName).toBe(
        'New Lesson'
      );
    });

    it('should add multiple lessons to a course', async () => {
      const course = await createTestCourse(ctx);
      let courseData = await verifyCourseStructure(ctx, course.basePath, 'test');

      const lessonsToAdd = ['Lesson 1', 'Lesson 2', 'Lesson 3'];

      for (const lessonName of lessonsToAdd) {
        courseData = await createAndVerifyLesson(
          ctx,
          course.basePath,
          courseData,
          lessonName
        );
      }

      expect(courseData.blocks[0].aus.length).toBeGreaterThanOrEqual(
        lessonsToAdd.length
      );

      const lessonNames = courseData.blocks[0].aus.map((au: any) => au.auName);
      lessonsToAdd.forEach((name) => {
        expect(lessonNames).toContain(name);
      });
    });

    it('should sync lesson changes to filesystem', async () => {
      const course = await createTestCourse(ctx);
      const courseData = await verifyCourseStructure(ctx, course.basePath, 'test');

      const newCourseData = await createAndVerifyLesson(
        ctx,
        course.basePath,
        courseData,
        'Synced Lesson'
      );

      const newLesson = newCourseData.blocks[0].aus[
        newCourseData.blocks[0].aus.length - 1
      ];
      const filepath = newLesson.slides[0].filepath;

      const operations: Record<string, Operation> = {
        [filepath]: Operation.Add,
      };

      const syncedCourseData = await syncCourseToFs(
        ctx,
        course.basePath,
        newCourseData,
        operations
      );

      expect(syncedCourseData).toBeTruthy();
      expect(syncedCourseData!.blocks[0].aus.length).toBe(
        newCourseData.blocks[0].aus.length
      );

      const syncedLesson = syncedCourseData!.blocks[0].aus.find(
        (au: any) => au.auName === 'Synced Lesson'
      );
      expect(syncedLesson).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases
  // --------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('should handle getting non-existent course', async () => {
      const courseData = await getCourseDataInFs({
        r: ctx.r,
        fsInstance: ctx.instance,
        coursePath: 'non-existent-course',
        getContents: true,
      });

      expect(courseData).toBeNull();
    });

    it('should handle invalid block index when creating lesson', async () => {
      const course = await createTestCourse(ctx);
      const courseData = await verifyCourseStructure(ctx, course.basePath, 'test');

      await expect(async () => {
        await createLesson({
          auName: 'Invalid Lesson',
          blockIndex: 999,
          courseData,
          coursePath: course.basePath,
          fsInstance: ctx.instance,
          r: ctx.r,
        });
      }).rejects.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // Integration Tests
  // --------------------------------------------------------------------------

  describe('Full Workflow Integration', () => {
    it('should handle complete course lifecycle', async () => {
      // 1. Create course
      const course = await createTestCourse(ctx, {
        courseTitle: 'Complete Course',
      });
      let courseData = await verifyCourseStructure(
        ctx,
        course.basePath,
        'Complete Course'
      );

      // 2. Add lessons
      const lessons = ['Intro', 'Chapter 1', 'Chapter 2', 'Conclusion'];
      for (const lessonName of lessons) {
        courseData = await createAndVerifyLesson(
          ctx,
          course.basePath,
          courseData,
          lessonName
        );
      }

      // 3. Sync to filesystem
      const operations: Record<string, Operation> = {};
      courseData.blocks[0].aus.forEach((au: any) => {
        au.slides.forEach((slide: any) => {
          operations[slide.filepath] = Operation.Add;
        });
      });

      const syncedData = await syncCourseToFs(
        ctx,
        course.basePath,
        courseData,
        operations
      );

      // 4. Verify final state
      expect(syncedData).toBeTruthy();
      expect(syncedData!.blocks[0].aus.length).toBeGreaterThanOrEqual(
        lessons.length
      );
      
      lessons.forEach((lessonName) => {
        const lesson = syncedData!.blocks[0].aus.find(
          (au: any) => au.auName === lessonName
        );
        expect(lesson).toBeDefined();
      });
    });
  });
});