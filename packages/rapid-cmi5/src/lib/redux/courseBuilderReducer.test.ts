import { CourseData, Operation } from '@rapid-cmi5/cmi5-build-common';
import reducer, {
  initialStateCourseBuilder,
  navigateSlide,
  saveSlideContent,
} from './courseBuilderReducer';

jest.mock('@rapid-cmi5/ui', () => ({
  defaultCourseData: {},
  resetPersistance: 'resetPersistance',
}));

const makeState = () => ({
  ...initialStateCourseBuilder,
  courseData: {
    blocks: [
      {
        aus: [
          {
            slides: [
              { filepath: 'first.md', content: 'First', slideTitle: 'First' },
              {
                filepath: 'second.md',
                content: 'Second',
                slideTitle: 'Second',
              },
            ],
          },
        ],
      },
    ],
  } as CourseData,
});

describe('saving slide content', () => {
  it('does not record edits when viewing and saving every slide', () => {
    let state = makeState();
    state = reducer(state, saveSlideContent({ position: 0, content: 'First' }));
    state = reducer(state, navigateSlide(1));
    state = reducer(
      state,
      saveSlideContent({ position: 1, content: 'Second' }),
    );
    expect(state.courseOperations).toEqual({});
    expect(state.dirtyDisplay).toBe(0);
  });

  it('records only the changed slide and saves at the requested position', () => {
    const state = reducer(
      makeState(),
      saveSlideContent({ position: 1, content: 'Edited' }),
    );
    expect(state.courseOperations).toEqual({ 'second.md': Operation.Edit });
    expect(state.courseData.blocks[0].aus[0].slides[0].content).toBe('First');
    expect(state.courseData.blocks[0].aus[0].slides[1].content).toBe('Edited');
    expect(
      reducer(state, saveSlideContent({ position: 1, content: 'Edited' })),
    ).toBe(state);
  });

  it('preserves the add operation for a new slide', () => {
    const state = makeState();
    state.courseOperations = { 'first.md': Operation.Add };
    const saved = reducer(
      state,
      saveSlideContent({ position: 0, content: 'Edited' }),
    );
    expect(saved.courseOperations).toEqual({ 'first.md': Operation.Add });
  });
});
