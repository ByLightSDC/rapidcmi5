import { describe, expect, it } from 'vitest';
import { CourseData } from '@rapid-cmi5/cmi5-build-common';
import { applyOverrides } from './courseOverrides';

describe('applyOverrides', () => {
  it('adds one scenario slide and one completion exam when applied twice', () => {
    const course = {
      courseId: 'course-id',
      courseTitle: 'Original course',
      blocks: [
        {
          blockName: 'Original block',
          aus: [
            {
              auName: 'Lesson',
              slides: [
                {
                  slideTitle: 'Content',
                  content: 'Lesson text',
                  filepath: 'lesson.md',
                },
              ],
            },
          ],
        },
      ],
    } as CourseData;
    const metadata = {
      courseName: 'Updated course',
      scenarioOverride: { uuid: 'scenario-id', name: 'Lab' },
      completionExam: true,
    };

    const result = applyOverrides(applyOverrides(course, metadata), metadata);
    const slides = result.blocks[0].aus[0].slides;

    expect(result.courseTitle).toBe('Updated course');
    expect(slides[0].content).toContain('"uuid": "scenario-id"');
    expect(
      slides.filter((slide) => slide.content?.includes(':::scenario')),
    ).toHaveLength(1);
    expect(
      slides.filter((slide) =>
        slide.content?.includes('"cmi5QuizId": "course-completion"'),
      ),
    ).toHaveLength(1);
  });
});
