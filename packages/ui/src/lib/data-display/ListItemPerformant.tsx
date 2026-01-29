import { useEffect, useRef, useState } from 'react';
import { useItemVisibleInBounds, useVariableItemHeight } from '../..';

// the height of the list item needs a default until the real height can be determined
const DEFAULT_ITEM_HEIGHT = 38;

/**
 * A performant list item watches for changes in visibility on screen.
 * When not visible, due to scrolling, the item does not render its contents.
 * Note: this component can be used as a wrapper around a normal list item.
 * @param props
 * @constructor
 */
export default function ListItemPerformant<T>(props: any) {
  // the outer container of the item, used to set the height so that scroll position is consistent
  const outerContainerRef = useRef(null);
  const [outerContainerHeight, setOuterContainerHeight] =
    useState(DEFAULT_ITEM_HEIGHT);
  const isVisible = useItemVisibleInBounds(
    outerContainerRef,
    props.parent,
    '100px',
  );

  // the inner container, used to calculate the height of the item contents
  const innerContainerRef = useRef(null);
  const itemHeight = useVariableItemHeight(innerContainerRef);

  /**
   * UE to watch for item height changes.
   * An example might be an item that has been expanded.
   */
  useEffect(() => {
    if (itemHeight > 0 && itemHeight !== outerContainerHeight) {
      setOuterContainerHeight(itemHeight);
    }
  }, [itemHeight, outerContainerHeight]);

  return (
    <div
      data-testid="outer-item-container"
      ref={outerContainerRef}
      style={{
        height: outerContainerHeight,
      }}
    >
      <div data-testid="inner-container" ref={innerContainerRef}>
        {isVisible && props.children}
      </div>
    </div>
  );
}
