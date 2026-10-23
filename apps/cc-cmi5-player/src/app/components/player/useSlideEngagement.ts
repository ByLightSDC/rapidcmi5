import { RefObject, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT_SLIDE_DWELL_SECONDS } from '@rapid-cmi5/cmi5-build-common';

import { auJsonSel } from '../../redux/auReducer';
import { store } from '../../redux/store';
import { recordSlideEngagement } from '../../utils/AuUtils';
import { logger } from '../../debug';

/**
 * Wait this long after a slide change before watching the sentinel. The editor
 * starts out empty, so until the slide's markdown renders the sentinel sits at
 * the top of the page and would read as "scrolled to the bottom".
 */
const SENTINEL_ARM_DELAY_MS = 500;

/**
 * The sentinel must stay visible this long before it counts. Images that load
 * after the text push it back out of view, which cancels the timer.
 */
const SENTINEL_CONFIRM_MS = 750;

/**
 * Credits a slide (that has no activities) once the learner sees its bottom
 * or has stayed on it for the AU's dwell time, whichever comes first.
 * The dwell timer restarts on every visit to the slide.
 *
 * @param sentinelRef element rendered after the slide's last content
 */
export function useSlideEngagement(
  activeTab: number,
  slideData: unknown,
  sentinelRef: RefObject<HTMLElement>,
) {
  const dispatch = useDispatch();
  const auJson = useSelector(auJsonSel);
  const dwellSeconds = auJson?.slideDwellSeconds ?? DEFAULT_SLIDE_DWELL_SECONDS;

  useEffect(() => {
    if (!auJson?.slides?.[activeTab]) return;

    let engaged = false;
    let observer: IntersectionObserver | null = null;
    let confirmTimer: ReturnType<typeof setTimeout> | undefined;

    const engage = (eventType: 'scroll_complete' | 'dwell_complete') => {
      if (engaged) return;
      engaged = true;
      cleanup();
      logger.debug(
        'Slide engagement met',
        { slide: activeTab, eventType },
        'lms',
      );
      recordSlideEngagement(
        activeTab,
        eventType,
        auJson,
        dispatch,
        store.getState,
      );
    };

    const dwellTimer = setTimeout(
      () => engage('dwell_complete'),
      dwellSeconds * 1000,
    );

    const armTimer = setTimeout(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel || engaged) return;

      // No explicit root: the viewport, clipped by every scrolling ancestor,
      // so this works whichever element ends up being the scroller.
      observer = new IntersectionObserver(([entry]) => {
        clearTimeout(confirmTimer);
        if (entry?.isIntersecting) {
          confirmTimer = setTimeout(
            () => engage('scroll_complete'),
            SENTINEL_CONFIRM_MS,
          );
        }
      });
      observer.observe(sentinel);
    }, SENTINEL_ARM_DELAY_MS);

    function cleanup() {
      clearTimeout(dwellTimer);
      clearTimeout(armTimer);
      clearTimeout(confirmTimer);
      observer?.disconnect();
    }

    return cleanup;
  }, [activeTab, slideData, auJson, dwellSeconds, dispatch, sentinelRef]);
}
