import type { CTFState } from '@rapid-cmi5/cmi5-build-common';
import activitySessionReducer, {
  setEntireCTFState,
} from './activitySessionReducer';

describe('activitySessionReducer CTF cache', () => {
  it('stores complete CTF progress under its slide and activity key', () => {
    const progress: CTFState = {
      ctfId: 'ctf-id',
      slideNumber: 2,
      currentQuestion: 1,
      answers: { 0: 'flag' },
      grades: { 0: 1 },
      score: 50,
      submitted: false,
    };

    const state = activitySessionReducer(
      undefined,
      setEntireCTFState({ key: '2/ctf-id', value: progress }),
    );

    expect(state.ctfCache).toEqual({ '2/ctf-id': progress });
  });
});
