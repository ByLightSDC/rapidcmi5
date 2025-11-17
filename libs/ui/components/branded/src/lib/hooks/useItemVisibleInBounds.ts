import { useEffect, useState } from 'react';

/**
 * This custom hook is used to determine if one html element is intersecting
 * another. The most likely use is to determine if an item in a list is
 * visible on screen.
 *
 * Note 1: for rootMargin, using a positive value like '100px' will expand the
 * bounds, while a negative number like '-100px' will contract.
 *
 * Note 2: for lists, it is highly recommended to use the list as the
 * rootElementRef. If you do not, the rootMargin usage is wasted.
 *
 * Note 3: for lists, using a bit of rootMargin gives a nice buffer.
 * Example: '100px' allows a list item to be a bit over or under the
 * list's top or bottom before being set as not visible.
 *
 * @param itemElementRef A reference to the html element in question
 * @param rootElementRef An optional reference to the root element. If null then the viewport is used.
 * @param rootMargin An optional offset rectangle used to shrink or expand the bounds being observed.
 * @param onVisibilityChange An optional callback that is called when visibility changes
 */
export const useItemVisibleInBounds = (
  itemElementRef: React.MutableRefObject<null>,
  rootElementRef: React.MutableRefObject<null> | null = null,
  rootMargin = '0px',
  onVisibilityChange?: (visible: boolean) => void,
) => {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Called when the IntersectionObserver notices an update.
   * NOTE: Notice that one entry is assumed and handled.
   * @param entries
   */
  const onIntersectUpdate = (entries: IntersectionObserverEntry[]) => {
    // Note: multiple entries are possible if multiple updates happen within one
    // frame. Grab the last entry as this represents the latest state.
    const entry = entries[entries.length - 1];

    setIsVisible((currentIsVisible) => {
      // only call the callback if the value has changed
      if (currentIsVisible !== entry.isIntersecting) {
        if (onVisibilityChange) {
          onVisibilityChange(entry.isIntersecting);
        }
      }

      return entry.isIntersecting;
    });
  };

  /**
   * UE used to create an IntersectionObserver that will watch for the defined
   * item to intersect the defined root element.
   * If the item is intersecting, set isVisible to true, else false.
   */
  useEffect(() => {
    const element = itemElementRef.current;

    const observer = new IntersectionObserver(onIntersectUpdate, {
      root: rootElementRef ? rootElementRef.current : null,
      rootMargin: rootMargin,
    });

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      } else {
        observer.disconnect();
      }
    };
  }, [itemElementRef, rootElementRef, rootMargin]);

  return isVisible;
};
