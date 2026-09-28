import { act, renderHook, waitFor } from '@testing-library/react';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import type { CTFState } from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '../../utility/logger';
import { useCTFCache } from './useCTFCache';

jest.mock('../../utility/logger', () => ({ debugLogError: jest.fn() }));

const cachedState: CTFState = {
  ctfId: 'ctf-id',
  slideNumber: 2,
  currentQuestion: 1,
  answers: { 0: 'flag' },
  grades: { 0: 1 },
  score: 50,
  submitted: false,
};

function baseOptions() {
  return {
    activeTab: 2,
    answers: {},
    ctfId: 'ctf-id',
    currentQuestion: 0,
    grades: {},
    questionCount: 2,
    score: 0,
    submitted: false,
    getActivityCache: jest.fn(),
    setActivityCache: jest.fn(),
    hydrate: jest.fn(),
  };
}

describe('useCTFCache', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hydrates valid cached progress for the current CTF', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue(cachedState);

    renderHook(() => useCTFCache(options));

    await waitFor(() =>
      expect(options.hydrate).toHaveBeenCalledWith(cachedState),
    );
    expect(options.getActivityCache).toHaveBeenCalledWith(
      RC5ActivityTypeEnum.ctf,
      { ctfId: 'ctf-id', slideNumber: 2 },
    );
  });

  it('ignores cache state belonging to another slide or invalid question', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue({
      ...cachedState,
      slideNumber: 9,
      currentQuestion: 8,
    });

    renderHook(() => useCTFCache(options));

    await waitFor(() => expect(options.setActivityCache).toHaveBeenCalled());
    expect(options.hydrate).not.toHaveBeenCalled();
  });

  it('persists the complete state after hydration and on question changes', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue(null);
    const { rerender } = renderHook(
      ({ currentQuestion, answers }) =>
        useCTFCache({ ...options, currentQuestion, answers }),
      { initialProps: { currentQuestion: 0, answers: {} } },
    );

    await waitFor(() => expect(options.setActivityCache).toHaveBeenCalled());
    options.setActivityCache.mockClear();

    rerender({ currentQuestion: 1, answers: { 0: 'typed flag' } });

    expect(options.setActivityCache).toHaveBeenCalledWith(
      RC5ActivityTypeEnum.ctf,
      {
        ctfId: 'ctf-id',
        slideNumber: 2,
        currentQuestion: 1,
        answers: { 0: 'typed flag' },
        grades: {},
        score: 0,
        submitted: false,
      },
    );
  });

  it('debounces draft answer writes', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue(null);
    const { rerender, unmount } = renderHook(
      ({ answers }) => useCTFCache({ ...options, answers }),
      { initialProps: { answers: {} } },
    );

    await waitFor(() => expect(options.setActivityCache).toHaveBeenCalled());
    options.setActivityCache.mockClear();
    jest.useFakeTimers();

    rerender({ answers: { 0: 'draft flag' } });
    act(() => jest.advanceTimersByTime(4999));
    expect(options.setActivityCache).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(options.setActivityCache).toHaveBeenCalledWith(
      RC5ActivityTypeEnum.ctf,
      expect.objectContaining({ answers: { 0: 'draft flag' } }),
    );

    unmount();
    jest.useRealTimers();
  });

  it('does not overwrite the cache while hydration is pending', async () => {
    let resolveCache: (value: null) => void = () => undefined;
    const options = baseOptions();
    options.getActivityCache.mockReturnValue(
      new Promise<null>((resolve) => {
        resolveCache = resolve;
      }),
    );

    renderHook(() => useCTFCache(options));
    expect(options.setActivityCache).not.toHaveBeenCalled();

    await act(async () => resolveCache(null));
    await waitFor(() => expect(options.setActivityCache).toHaveBeenCalled());
  });

  it('logs cache load failures and then enables saving', async () => {
    const options = baseOptions();
    options.getActivityCache.mockRejectedValue(new Error('offline'));

    renderHook(() => useCTFCache(options));

    await waitFor(() => expect(debugLogError).toHaveBeenCalled());
    expect(options.setActivityCache).toHaveBeenCalled();
  });
});
