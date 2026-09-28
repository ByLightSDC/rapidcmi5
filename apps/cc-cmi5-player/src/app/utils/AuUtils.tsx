import type { Dispatch } from '@reduxjs/toolkit';
import type { CourseAU } from '@rapid-cmi5/cmi5-build-common';
import type { MutableRefObject } from 'react';

import { logger } from '../debug';
import { courseAUProgressSel, setCourseAUProgress } from '../redux/auReducer';
import { setActiveTab } from '../redux/navigationReducer';
import type { RootState } from '../redux/store';
import { store } from '../redux/store';
import { cmi5Instance } from '../session/cmi5';
import type { CourseAUProgress } from '../types/CourseAUProgress';
import type { State } from '../types/SlideState';
import { getSlideState } from './Cmi5Helpers';
import {
  getCourseAUProgressFromLRS,
  getFirstIncompleteSlideIndex,
  initializeCourseAUProgress,
} from './CourseAUProgressHelpers';
import { checkForDevMode } from './DevMode';
import { handleSlideViewed } from './LmsStatementManager';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function mergeRestoredProgress(
  currentProgress: CourseAUProgress,
  restoredProgress: CourseAUProgress,
): CourseAUProgress {
  return {
    ...currentProgress,
    progress: restoredProgress.progress,
    lastUpdated: restoredProgress.lastUpdated || new Date().toISOString(),
    version: restoredProgress.version || currentProgress.version,
  };
}

function shouldForceFreshLaunch(): boolean {
  const browserOverride =
    typeof window !== 'undefined' &&
    window._env_?.NX_PUBLIC_E2E_FORCE_FRESH_LAUNCH === true;
  return (
    browserOverride ||
    process.env['NX_PUBLIC_E2E_FORCE_FRESH_LAUNCH'] === 'true'
  );
}

function getResumeSlideIndex(progress: CourseAUProgress): number {
  const firstIncompleteSlide = getFirstIncompleteSlideIndex(progress);

  if (shouldForceFreshLaunch() && firstIncompleteSlide !== 0) {
    logger.info(
      '[E2E] NX_PUBLIC_E2E_FORCE_FRESH_LAUNCH set — overriding resume slide',
      { originalResumeSlide: firstIncompleteSlide, overriddenTo: 0 },
      'auManager',
    );
    return 0;
  }

  return firstIncompleteSlide;
}

async function restoreLegacyBookmark(dispatch: Dispatch): Promise<void> {
  try {
    const slideState = (await getSlideState()) as State;
    dispatch(setActiveTab(slideState.currentSlide ?? 0));
  } catch (error) {
    logger.error(
      'Error in fallback resume - defaulting to first slide',
      { error: errorMessage(error) },
      'auManager',
    );
    dispatch(setActiveTab(0));
  }
}

async function initializeFreshProgress(
  auJson: CourseAU,
  dispatch: Dispatch,
): Promise<void> {
  const freshProgress = initializeCourseAUProgress({ auJson });

  dispatch(setCourseAUProgress(freshProgress));
  dispatch(setActiveTab(0));

  await progressAU(0, true, auJson, dispatch, store.getState);
}

/**
 * Restores course progress from the LRS, falling back to the legacy slide
 * bookmark when restoration fails.
 */
export async function resumeAU(
  dispatch: Dispatch,
  isInitializedProgressDataRef: MutableRefObject<boolean>,
  auJson: CourseAU,
): Promise<void> {
  if (checkForDevMode()) {
    logger.debug(
      'Dev mode detected, skipping resumeAU',
      undefined,
      'auManager',
    );
    return;
  }

  logger.info('Starting AU resume process', undefined, 'auManager');

  if (cmi5Instance.xapi === null) {
    logger.error(
      'Error getting XAPI when attempting to resume AU, fatal error',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  try {
    const activityId = cmi5Instance.getLaunchParameters().activityId;
    const restoredProgress = await getCourseAUProgressFromLRS(activityId);
    isInitializedProgressDataRef.current = true;

    if (!restoredProgress) {
      logger.debug(
        'No LRS progress; using default progress data built from AU JSON',
        undefined,
        'auManager',
      );
      await initializeFreshProgress(auJson, dispatch);
      return;
    }

    const currentProgress = courseAUProgressSel(store.getState());
    if (!currentProgress) {
      throw new Error('CourseAUProgress not initialized in store');
    }

    const mergedProgress = mergeRestoredProgress(
      currentProgress,
      restoredProgress,
    );
    const resumeSlideIndex = getResumeSlideIndex(mergedProgress);

    dispatch(setCourseAUProgress(mergedProgress));
    dispatch(setActiveTab(resumeSlideIndex));
  } catch (error) {
    logger.error(
      'Error during AU resume, falling back to legacy bookmark',
      { error: errorMessage(error), bookmark: undefined },
      'auManager',
    );
    await restoreLegacyBookmark(dispatch);
  }
}

/**
 * Records navigation to a slide. Progress persistence is delegated to
 * handleSlideViewed.
 */
export async function progressAU(
  slideIdx: number,
  makeProgress: boolean,
  auJson: CourseAU,
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  if (checkForDevMode()) {
    logger.debug('Dev mode detected, returning early', undefined, 'auManager');
    return;
  }

  const slide = auJson.slides[slideIdx];
  if (!slide) {
    logger.warn(
      'Cannot progress AU because the slide index is out of range',
      { slideIdx, totalSlides: auJson.slides.length },
      'auManager',
    );
    return;
  }

  const slideGuid = slide.filepath || `slide-${slideIdx}`;
  const slideName = slide.slideTitle;

  void handleSlideViewed(
    {
      slideGuid,
      slideName,
      slideNumber: slideIdx,
      makeProgress,
      eventType: 'navigation',
    },
    dispatch,
    getState,
  ).catch((error) => {
    logger.error('Error in handleSlideViewed', error, 'auManager');
  });
}
