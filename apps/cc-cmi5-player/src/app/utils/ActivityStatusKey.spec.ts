import { getActivityStatus, getActivityStatusKey } from './ActivityStatusKey';
import { SlideActivityType } from '../types/SlideActivityStatusState';

const status = (slideGuid: string, slideIndex: number, passed = false) => ({
  type: SlideActivityType.QUIZ,
  slideIndex,
  slideGuid,
  completed: passed,
  passed,
});

describe('activity status keys', () => {
  const firstSlide = 'slides/01.md';
  const secondSlide = 'slides/02.md';
  const activityId = 'quiz';
  const fresh = {
    [getActivityStatusKey(firstSlide, activityId)]: status(firstSlide, 0),
    [getActivityStatusKey(secondSlide, activityId)]: status(secondSlide, 1),
  };

  it('keeps identical activity IDs isolated by slide', () => {
    const firstKey = getActivityStatusKey(firstSlide, activityId);
    const secondKey = getActivityStatusKey(secondSlide, activityId);

    expect(firstKey).not.toBe(secondKey);
    expect(getActivityStatus(fresh, firstSlide, activityId)?.slideIndex).toBe(
      0,
    );
    expect(getActivityStatus(fresh, secondSlide, activityId)?.slideIndex).toBe(
      1,
    );
  });
});
