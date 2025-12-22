import { useState, useEffect } from 'react';

/**
 * Hook determines if element is visible to the user
 * @param {any} elementRef
 * @return {boolean}
 */
export const useIsVisible = (elementRef: any) => {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Sets up IntersectionObserver when ref is initializes
   */
  useEffect(() => {
    if (elementRef.current) {
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              //NOTE: when applying after "multi select", sometimes the elementRef is cleared while re-rendering
              if (elementRef.current) {
                observer.unobserve(elementRef.current);
              }
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px 0px 0px',
          threshold: 0,
        },
      );
      observer.observe(elementRef.current);
    }
  }, [elementRef]);

  return isVisible;
};
