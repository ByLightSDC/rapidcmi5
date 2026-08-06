import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auJsonSel } from '../../redux/auReducer';
import { activeTabSel, setActiveTab } from '../../redux/navigationReducer';

/**
 * Forward/back slide navigation for the player's slide controls.
 *
 * Wraps the `activeTab` Redux slice so components get bounds-checked movement
 * instead of re-deriving the edge cases. Note `slides.length` is the Exit
 * slide's index — a valid forward target, but not a content slide.
 */
export function useSlideNavigation() {
  const dispatch = useDispatch();
  const auJson = useSelector(auJsonSel);
  const activeTab = useSelector(activeTabSel);

  const slideCount = auJson?.slides?.length ?? 0;
  const canGoPrevious = activeTab > 0;
  const canGoNext = activeTab < slideCount;

  const goToPrevious = useCallback(() => {
    if (activeTab > 0) dispatch(setActiveTab(activeTab - 1));
  }, [activeTab, dispatch]);

  const goToNext = useCallback(() => {
    if (activeTab < slideCount) dispatch(setActiveTab(activeTab + 1));
  }, [activeTab, slideCount, dispatch]);

  return { canGoPrevious, canGoNext, goToPrevious, goToNext };
}
