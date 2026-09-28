jest.mock('../redux/auReducer', () => ({
  courseAUProgressSel: jest.fn(),
  setCourseAUProgress: jest.fn((payload) => ({
    type: 'setCourseAUProgress',
    payload,
  })),
}));

jest.mock('../redux/navigationReducer', () => ({
  setActiveTab: jest.fn((payload) => ({ type: 'setActiveTab', payload })),
}));

jest.mock('../redux/store', () => ({
  store: { getState: jest.fn() },
}));

jest.mock('../session/cmi5', () => ({
  cmi5Instance: {
    xapi: {},
    getLaunchParameters: jest.fn(() => ({
      activityId: 'https://example.com/course',
    })),
  },
}));

jest.mock('./Cmi5Helpers', () => ({
  getSlideState: jest.fn(),
}));

jest.mock('./CourseAUProgressHelpers', () => ({
  getCourseAUProgressFromLRS: jest.fn(),
  getFirstIncompleteSlideIndex: jest.fn(),
  initializeCourseAUProgress: jest.fn(),
}));

jest.mock('./DevMode', () => ({
  checkForDevMode: jest.fn(),
}));

jest.mock('./LmsStatementManager', () => ({
  handleSlideViewed: jest.fn(),
}));

jest.mock('../debug', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import type { CourseAU } from '@rapid-cmi5/cmi5-build-common';
import { logger } from '../debug';
import { courseAUProgressSel, setCourseAUProgress } from '../redux/auReducer';
import { setActiveTab } from '../redux/navigationReducer';
import { store } from '../redux/store';
import { cmi5Instance } from '../session/cmi5';
import type { CourseAUProgress } from '../types/CourseAUProgress';
import { getSlideState } from './Cmi5Helpers';
import {
  getCourseAUProgressFromLRS,
  getFirstIncompleteSlideIndex,
  initializeCourseAUProgress,
} from './CourseAUProgressHelpers';
import { checkForDevMode } from './DevMode';
import { handleSlideViewed } from './LmsStatementManager';
import { progressAU, resumeAU } from './AuUtils';

const mockCourseProgressSelector = courseAUProgressSel as jest.Mock;
const mockGetStoredProgress = getCourseAUProgressFromLRS as jest.Mock;
const mockGetFirstIncompleteSlide = getFirstIncompleteSlideIndex as jest.Mock;
const mockInitializeProgress = initializeCourseAUProgress as jest.Mock;
const mockGetSlideState = getSlideState as jest.Mock;
const mockCheckForDevMode = checkForDevMode as jest.Mock;
const mockHandleSlideViewed = handleSlideViewed as jest.Mock;
const mockStoreGetState = store.getState as jest.Mock;
const mockLogger = logger as jest.Mocked<typeof logger>;

const auJson: CourseAU = {
  auName: 'Test AU',
  dirPath: 'test-au',
  slides: [
    { slideTitle: 'First slide', filepath: 'first.md' },
    { slideTitle: 'Second slide', filepath: 'second.md' },
  ],
};

function makeProgress(
  overrides: Partial<CourseAUProgress> = {},
): CourseAUProgress {
  return {
    courseStructure: {
      auId: 'test-au',
      auTitle: 'Test AU',
      totalSlides: 2,
      slides: [
        { slideIndex: 0, slideGuid: 'first.md', slideTitle: 'First slide' },
        { slideIndex: 1, slideGuid: 'second.md', slideTitle: 'Second slide' },
      ],
    },
    slideActivitiesMeta: {},
    progress: {
      auProgress: 0,
      auCompleted: false,
      auPassed: false,
      totalProgressSteps: 2,
      slideStatus: {},
      activityStatus: {},
    },
    lastUpdated: '2026-01-01T00:00:00.000Z',
    version: '1',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckForDevMode.mockReturnValue(false);
  mockHandleSlideViewed.mockResolvedValue(undefined);
  mockStoreGetState.mockReturnValue({ au: {} });
  cmi5Instance.xapi = {} as typeof cmi5Instance.xapi;
  delete process.env['NX_PUBLIC_E2E_FORCE_FRESH_LAUNCH'];
});

describe('resumeAU', () => {
  it('returns without accessing the LRS in development mode', async () => {
    mockCheckForDevMode.mockReturnValue(true);
    const dispatch = jest.fn();
    const initialized = { current: false };

    await resumeAU(dispatch, initialized, auJson);

    expect(mockGetStoredProgress).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(initialized.current).toBe(false);
  });

  it('fails fast when XAPI is unavailable', async () => {
    cmi5Instance.xapi = null;

    await expect(
      resumeAU(jest.fn(), { current: false }, auJson),
    ).rejects.toThrow('XAPI null after authentication');
    expect(mockGetSlideState).not.toHaveBeenCalled();
  });

  it('merges restored progress with the current course structure', async () => {
    const current = makeProgress({ version: 'current-version' });
    const restored = makeProgress({
      progress: {
        ...makeProgress().progress,
        auProgress: 60,
        auCompleted: true,
      },
      lastUpdated: '2026-02-02T00:00:00.000Z',
      version: 'restored-version',
    });
    const dispatch = jest.fn();
    const initialized = { current: false };
    mockGetStoredProgress.mockResolvedValue(restored);
    mockCourseProgressSelector.mockReturnValue(current);
    mockGetFirstIncompleteSlide.mockReturnValue(1);

    await resumeAU(dispatch, initialized, auJson);

    expect(mockGetStoredProgress).toHaveBeenCalledWith(
      'https://example.com/course',
    );
    expect(initialized.current).toBe(true);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setCourseAUProgress({
        ...current,
        progress: restored.progress,
        lastUpdated: restored.lastUpdated,
        version: restored.version,
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, setActiveTab(1));
    expect(mockGetFirstIncompleteSlide).toHaveBeenCalledWith(
      expect.objectContaining({
        courseStructure: current.courseStructure,
        progress: restored.progress,
      }),
    );
  });

  it('keeps current metadata when optional restored metadata is empty', async () => {
    const current = makeProgress({ version: 'current-version' });
    const restored = makeProgress({ lastUpdated: '', version: '' });
    const dispatch = jest.fn();
    mockGetStoredProgress.mockResolvedValue(restored);
    mockCourseProgressSelector.mockReturnValue(current);
    mockGetFirstIncompleteSlide.mockReturnValue(0);

    await resumeAU(dispatch, { current: false }, auJson);

    const merged = (dispatch.mock.calls[0][0] as { payload: CourseAUProgress })
      .payload;
    expect(merged.version).toBe('current-version');
    expect(merged.lastUpdated).toEqual(expect.any(String));
    expect(merged.lastUpdated).not.toBe('');
  });

  it('honors the fresh-launch E2E override', async () => {
    process.env['NX_PUBLIC_E2E_FORCE_FRESH_LAUNCH'] = 'true';
    mockGetStoredProgress.mockResolvedValue(makeProgress());
    mockCourseProgressSelector.mockReturnValue(makeProgress());
    mockGetFirstIncompleteSlide.mockReturnValue(1);
    const dispatch = jest.fn();

    await resumeAU(dispatch, { current: false }, auJson);

    expect(dispatch).toHaveBeenLastCalledWith(setActiveTab(0));
  });

  it('initializes fresh progress when no LRS progress exists', async () => {
    const freshProgress = makeProgress();
    const dispatch = jest.fn();
    const initialized = { current: false };
    mockGetStoredProgress.mockResolvedValue(null);
    mockInitializeProgress.mockReturnValue(freshProgress);

    await resumeAU(dispatch, initialized, auJson);

    expect(mockInitializeProgress).toHaveBeenCalledWith({ auJson });
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setCourseAUProgress(freshProgress),
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, setActiveTab(0));
    expect(mockHandleSlideViewed).toHaveBeenCalledWith(
      expect.objectContaining({ slideGuid: 'first.md', slideNumber: 0 }),
      dispatch,
      store.getState,
    );
    expect(initialized.current).toBe(true);
  });

  it('falls back to the legacy bookmark when restoration fails', async () => {
    const dispatch = jest.fn();
    mockGetStoredProgress.mockRejectedValue(new Error('LRS unavailable'));
    mockGetSlideState.mockResolvedValue({ currentSlide: 4 });

    await resumeAU(dispatch, { current: false }, auJson);

    expect(dispatch).toHaveBeenCalledWith(setActiveTab(4));
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error during AU resume, falling back to legacy bookmark',
      expect.objectContaining({ error: 'LRS unavailable' }),
      'auManager',
    );
  });

  it('falls back when the current course structure is unavailable', async () => {
    const dispatch = jest.fn();
    mockGetStoredProgress.mockResolvedValue(makeProgress());
    mockCourseProgressSelector.mockReturnValue(undefined);
    mockGetSlideState.mockResolvedValue({ currentSlide: 1 });

    await resumeAU(dispatch, { current: false }, auJson);

    expect(dispatch).toHaveBeenCalledWith(setActiveTab(1));
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error during AU resume, falling back to legacy bookmark',
      expect.objectContaining({
        error: 'CourseAUProgress not initialized in store',
      }),
      'auManager',
    );
  });

  it('uses the first slide when legacy bookmark restoration also fails', async () => {
    const dispatch = jest.fn();
    mockGetStoredProgress.mockRejectedValue(new Error('LRS unavailable'));
    mockGetSlideState.mockRejectedValue(new Error('No bookmark'));

    await resumeAU(dispatch, { current: false }, auJson);

    expect(dispatch).toHaveBeenLastCalledWith(setActiveTab(0));
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error in fallback resume - defaulting to first slide',
      { error: 'No bookmark' },
      'auManager',
    );
  });
});

describe('progressAU', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();

  it('queues slide navigation with the resolved slide identity', async () => {
    await progressAU(1, true, auJson, dispatch, getState);

    expect(mockHandleSlideViewed).toHaveBeenCalledWith(
      {
        slideGuid: 'second.md',
        slideName: 'Second slide',
        slideNumber: 1,
        makeProgress: true,
        eventType: 'navigation',
      },
      dispatch,
      getState,
    );
  });

  it('does not process navigation in development mode', async () => {
    mockCheckForDevMode.mockReturnValue(true);

    await progressAU(0, true, auJson, dispatch, getState);

    expect(mockHandleSlideViewed).not.toHaveBeenCalled();
  });

  it.each([-1, 2])(
    'ignores an out-of-range slide index (%s)',
    async (index) => {
      await progressAU(index, true, auJson, dispatch, getState);

      expect(mockHandleSlideViewed).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cannot progress AU because the slide index is out of range',
        { slideIdx: index, totalSlides: 2 },
        'auManager',
      );
    },
  );

  it('logs asynchronous slide update failures', async () => {
    const error = new Error('update failed');
    mockHandleSlideViewed.mockRejectedValueOnce(error);

    await progressAU(0, true, auJson, dispatch, getState);
    await Promise.resolve();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error in handleSlideViewed',
      error,
      'auManager',
    );
  });
});
