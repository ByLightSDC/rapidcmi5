import { cmi5Instance } from '../session/cmi5';
import { setCourseAUProgress, courseAUProgressSel } from '../redux/auReducer';

import { setActiveTab } from '../redux/navigationReducer';
import { State } from '../types/SlideState';
import { getSlideState } from './Cmi5Helpers';
import { Dispatch } from '@reduxjs/toolkit';
import { checkForDevMode } from './DevMode';
import { logger } from '../debug';
import { handleSlideViewed } from './LmsStatementManager';
import { RootState, store } from '../redux/store';
import {
  initializeCourseAUProgress,
  getCourseAUProgressFromLRS,
  getFirstIncompleteSlideIndex,
} from './CourseAUProgressHelpers';
import { CourseAU } from '@rapid-cmi5/cmi5-build-common';

/**
 * Retrieves current slide from LRS and restores full CourseAUProgress
 * @param dispatch
 * @returns
 */
export async function resumeAU(
  dispatch: Dispatch,
  isInitializedProgressDataRef: React.MutableRefObject<boolean>,
  auJson: any,
) {
  if (checkForDevMode()) {
    logger.debug(
      'Dev mode detected, skipping resumeAU',
      undefined,
      'auManager',
    );
    return;
  }

  logger.info('Starting AU resume process', undefined, 'auManager');

  const xapi = cmi5Instance.xapi;

  if (xapi === null) {
    logger.error(
      'Error getting XAPI when attempting to resume AU, fatal error',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  try {
    // REF 1. Get legacy bookmark (current slide) from LRS
    // const slideState = (await getSlideState()) as State;
    // const bookmark = slideState.currentSlide;

    // logger.debug(
    //   'Retrieved legacy slide state from LRS',
    //   { bookmark, slideState },
    //   'auManager',
    // );

    // 2. Try to restore full CourseAUProgress from LRS
    const activityId = cmi5Instance.getLaunchParameters().activityId;
    console.log(' calling getCourseAUProgressFromLRS');
    const loadedProgress = await getCourseAUProgressFromLRS(activityId);

    console.log('after getCourseAUProgressFromLRS', loadedProgress);
    isInitializedProgressDataRef.current = true;

    if (loadedProgress) {
      logger.info(
        'Restored CourseAUProgress from LRS',
        {
          version: loadedProgress.version,
          lastUpdated: loadedProgress.lastUpdated,
          auProgress: loadedProgress.progress.auProgress,
          fullObject: JSON.stringify(loadedProgress, null, 2),
          auCompleted: loadedProgress.progress.auCompleted,
          auPassed: loadedProgress.progress.auPassed,
          totalActivities: Object.keys(loadedProgress.progress.activityStatus)
            .length,
          totalSlides: Object.keys(loadedProgress.progress.slideStatus).length,
        },
        'auManager',
      );

      // Merge the LRS progress with the existing structure
      const currentCourseAUProgress = courseAUProgressSel(store.getState());

      if (!currentCourseAUProgress) {
        logger.error(
          'No current CourseAUProgress in store when trying to merge LRS data',
          undefined,
          'auManager',
        );
        throw new Error('CourseAUProgress not initialized in store');
      }
      logger.debug(
        'Merging LRS progress with existing structure',
        {
          currentCourseAUProgress,
          loadedProgress,
        },
        'auManager',
      );

      dispatch(
        setCourseAUProgress({
          ...currentCourseAUProgress, // Keep courseStructure, slideActivitiesMeta, etc.
          progress: loadedProgress.progress, // Extract the actual progress data
          lastUpdated: loadedProgress.lastUpdated || new Date(),
          version: loadedProgress.version || currentCourseAUProgress.version,
        }),
      );

      /* REF
      // Extract viewed slides for legacy compatibility
      const viewedSlides: number[] = [];
      Object.entries(loadedProgress.progress.slideStatus).forEach(
        ([slideGuid, status]) => {
          if (status.viewed) {
            // Find the slide index for this slideGuid
            const slideIndex = loadedProgress.courseStructure.slides.findIndex(
              (slide) => slide.slideGuid === slideGuid,
            );
            if (slideIndex !== -1 && !viewedSlides.includes(slideIndex)) {
              viewedSlides.push(slideIndex);
            }
          }
        },
      );
      dispatch(setAuViewedSlides(viewedSlides));

      logger.debug(
        'Updated legacy progress fields',
        {
          auProgress: loadedProgress.progress.auProgress,
          viewedSlides,
        },
        'auManager',
      );
      */

      // Determine the best slide to resume to
      // Priority: 1) First incomplete slide, 2) Legacy bookmark, 3) First slide
      // Get the updated CourseAUProgress from store (now that it has both contentStructure and initialized progress data)
      const updatedCourseAUProgress = courseAUProgressSel(store.getState());
      const resumeSlideIndex = updatedCourseAUProgress
        ? getFirstIncompleteSlideIndex(updatedCourseAUProgress)
        : 0;

      logger.info(
        'Determined resume slide',
        {
          // legacyBookmark: bookmark,
          firstIncompleteSlide: resumeSlideIndex,
          finalResumeSlide: resumeSlideIndex,
        },
        'auManager',
      );

      dispatch(setActiveTab(resumeSlideIndex));
    } else {
      // no existing progress => use default progress data
      logger.debug(
        'no LRS progress => use default progress data built from AU JSON',
      );

      // Initialize fresh progress data
      const freshProgress = initializeCourseAUProgress({
        auJson: auJson,
      });

      // Mark progress data as initialized
      isInitializedProgressDataRef.current = true;
      // Set the initial Redux state
      dispatch(setCourseAUProgress(freshProgress));

      // Set the active tab to the first slide

      dispatch(setActiveTab(0));

      progressAU(
        0, // or resumeSlideIndex
        true, // makeProgress
        auJson,
        [], // viewedSlides - legacy usage
        dispatch,
        store.getState,
      );
    }
  } catch (error) {
    logger.error(
      'Error during AU resume, falling back to legacy bookmark',
      {
        error: error instanceof Error ? error.message : String(error),
        bookmark: undefined,
      },
      'auManager',
    );

    // Fallback to legacy bookmark behavior
    try {
      const slideState = (await getSlideState()) as State;
      const bookmark = slideState.currentSlide;
      dispatch(setActiveTab(bookmark || 0));
    } catch (fallbackError) {
      logger.error(
        'Error in fallback resume - defaulting to first slide',
        {
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError),
        },
        'auManager',
      );
      dispatch(setActiveTab(0));
    }
  }
}

/**
 * Updates LRS current slide and slides viewed progress
 * @param slideIdx
 * @param makeProgress
 * @param auJson
 * @param viewedSlides
 * @param dispatch
 * @param getState - Function to get current Redux state
 * @returns
 */
export async function progressAU(
  slideIdx: number, // Renamed from newBookmark for clarity - this is the slide index to process
  makeProgress: boolean,
  auJson: CourseAU,
  viewedSlides: number[],
  dispatch: Dispatch,
  getState: () => RootState,
) {
  logger.debug(
    'progressAU called',
    {
      slideIdx, // Use slideIdx consistently throughout the function
      makeProgress,
      auJsonSlidesLength: auJson.slides.length,
      viewedSlidesLength: viewedSlides.length,
      viewedSlides,
    },
    'auManager',
  );

  if (checkForDevMode()) {
    logger.debug('Dev mode detected, returning early', undefined, 'auManager');
    return;
  }

  // REF If there are no slides in our redux state we will get from the LRS
  // We will update the LRS when changes are made and the only time we read from the LRS is on init

  // const slides = [...viewedSlides];
  // logger.debug('Initial slides array', { slides }, 'auManager');

  // TEMPORARILY DISABLED: LRS activity state fetching until core progress flow is working
  // if (slides.length === 0) {
  //   logger.debug(
  //     'No slides in redux state, fetching from LRS',
  //     undefined,
  //     'auManager',
  //   );
  //   const slidesState = (await getSlideState()) as State;
  //   logger.debug(
  //     'Retrieved slides state from LRS',
  //     { slidesState },
  //     'auManager',
  //   );

  //   if (slidesState.slides === undefined) {
  //     logger.debug(
  //       'Slides state is undefined, returning early',
  //       undefined,
  //       'auManager',
  //     );
  //     console.error('Slides should not be undefined');
  //     return;
  //   }
  //   if (!slidesState) {
  //     logger.debug(
  //       'AU state in LRS was invalid, throwing error',
  //       undefined,
  //       'auManager',
  //     );
  //     console.log('AU state in LRS was invalid, fatal error');
  //     throw new Error('Fatal error LRS AU state');
  //   }
  //   slides = slidesState.slides;
  //   logger.debug('Updated slides from LRS state', { slides }, 'auManager');
  // }

  if (auJson.slides.length === 0) {
    logger.debug(
      'AU JSON has no slides, returning early',
      undefined,
      'auManager',
    );
    return;
  }

  // Progress calculation is now handled by handleSlideViewed and courseAUProgress
  // No need to calculate legacy progress here

  // Always call handleSlideViewed for every slide navigation
  // This ensures slideStatus.viewed is properly updated for the current slide
  // The legacy viewedSlides array logic is causing issues with slide completion tracking
  logger.debug(
    'Processing slide navigation',
    {
      slideIdx,
      // slides,
      makeProgress,
    },
    'auManager',
  );

  const slideGuid = auJson.slides[slideIdx].filepath || `slide-${slideIdx}`;
  const slideName = auJson.slides[slideIdx].slideTitle;

  handleSlideViewed(
    {
      slideGuid,
      slideName,
      slideNumber: slideIdx,
      makeProgress,
      eventType: 'navigation', // TODO: are we sure this is always navigation?
    },
    dispatch,
    getState,
  ).catch((error) => {
    logger.error('Error in handleSlideViewed', error, 'auManager');
  });

  logger.debug(
    'progressAU: Slide progress update completed via handleSlideViewed',
    {
      slideGuid,
      slideName,
      slideNumber: slideIdx,
      makeProgress,
    },
    'auManager',
  );

  logger.debug('progressAU completed successfully', undefined, 'auManager');
}
