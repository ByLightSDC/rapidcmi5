import { useEffect, useState } from 'react';

/**
 * Likely being used for items in a list, this custom hook observes an item,
 * watching for changes in size, and returning the updated height.
 * @param itemElementRef
 */
export const useVariableItemHeight = (
  itemElementRef: React.MutableRefObject<null>,
) => {
  const [height, setHeight] = useState(50);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setHeight(entry.contentRect.height);
      }
    });

    if (itemElementRef.current) {
      observer.observe(itemElementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [itemElementRef]);

  return height;
};
