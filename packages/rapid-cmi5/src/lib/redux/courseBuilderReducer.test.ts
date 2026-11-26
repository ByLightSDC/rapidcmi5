import { Operation } from '@rapid-cmi5/cmi5-build-common';
import reducer, {
  initialStateCourseBuilder,
  saveSlideContent,
} from './courseBuilderReducer';

function courseState() {
  return {
    ...initialStateCourseBuilder,
    courseData: {
      ...initialStateCourseBuilder.courseData,
      blocks: [
        {
          blockName: 'Block',
          aus: [
            {
              auName: 'Lesson',
              dirPath: 'lesson',
              slides: [
                {
                  filepath: 'lesson/slide.md',
                  slideTitle: 'Slide',
                  content: 'Saved content',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

describe('capturing slide content during navigation', () => {
  it('does not queue a file edit for an unchanged slide', () => {
    const before = courseState();
    const after = reducer(
      before,
      saveSlideContent({
        position: 0,
        content: 'Saved content',
        skipShouldDirty: true,
      }),
    );
    expect(after).toBe(before);
    expect(after.courseOperations).toEqual({});
    expect(after.dirtyDisplay).toBe(0);
  });

  it('queues real changes and preserves the unsaved indicator', () => {
    const before = { ...courseState(), dirtyDisplay: 1 };
    const after = reducer(
      before,
      saveSlideContent({
        position: 0,
        content: 'Edited content',
        skipShouldDirty: true,
      }),
    );
    expect(after.courseOperations).toEqual({
      'lesson/slide.md': Operation.Edit,
    });
    expect(after.courseData.blocks[0].aus[0].slides[0].content).toBe(
      'Edited content',
    );
    expect(after.dirtyDisplay).toBe(1);
  });

  it('keeps pending operations when unchanged content is captured again', () => {
    const before = {
      ...courseState(),
      courseOperations: { 'lesson/slide.md': Operation.Add },
      dirtyDisplay: 1,
    };
    const after = reducer(
      before,
      saveSlideContent({
        position: 0,
        content: 'Saved content',
        skipShouldDirty: true,
      }),
    );
    expect(after).toBe(before);
    expect(after.courseOperations['lesson/slide.md']).toBe(Operation.Add);
    expect(after.dirtyDisplay).toBe(1);
  });
});
