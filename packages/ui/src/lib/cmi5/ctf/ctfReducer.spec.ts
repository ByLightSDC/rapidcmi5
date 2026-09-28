import type { CTFState } from '@rapid-cmi5/cmi5-build-common';
import {
  ctfReducer,
  getAllCTFAnswers,
  hydrateCTFActivity,
  resetCTFActivity,
  setCurrentCTFAnswer,
} from './ctfReducer';

describe('ctfReducer', () => {
  it('hydrates all persisted CTF progress', () => {
    const progress: CTFState = {
      ctfId: 'ctf-id',
      slideNumber: 4,
      currentQuestion: 2,
      answers: { 0: 'first', 2: 'third' },
      grades: { 0: 1, 2: 0 },
      score: 50,
      submitted: true,
    };

    expect(ctfReducer(undefined, hydrateCTFActivity(progress))).toEqual({
      currentQuestion: 2,
      currentAnswers: progress.answers,
      currentGrades: progress.grades,
      score: 50,
      submitted: true,
    });
  });

  it('preserves question indexes when producing score answers', () => {
    const state = ctfReducer(
      undefined,
      hydrateCTFActivity({
        ctfId: 'ctf-id',
        slideNumber: 4,
        currentQuestion: 2,
        answers: { 2: 'third' },
        grades: { 2: 1 },
        score: 0,
        submitted: false,
      }),
    );

    const answers = getAllCTFAnswers({ auCTF: state });
    expect(answers).toHaveLength(3);
    expect(answers[0]).toBeUndefined();
    expect(answers[2]).toBe('third');
  });

  it('keeps a draft answer before it has been graded', () => {
    const state = ctfReducer(undefined, setCurrentCTFAnswer('draft flag'));

    expect(state.currentAnswers).toEqual({ 0: 'draft flag' });
    expect(state.currentGrades).toEqual({});
  });

  it('clears restored progress on reset', () => {
    const hydrated = ctfReducer(
      undefined,
      hydrateCTFActivity({
        ctfId: 'ctf-id',
        slideNumber: 4,
        currentQuestion: 1,
        answers: { 1: 'answer' },
        grades: { 1: 1 },
        score: 100,
        submitted: true,
      }),
    );

    expect(ctfReducer(hydrated, resetCTFActivity())).toEqual({
      currentQuestion: 0,
      currentAnswers: {},
      currentGrades: {},
      score: 0,
      submitted: false,
    });
  });
});
