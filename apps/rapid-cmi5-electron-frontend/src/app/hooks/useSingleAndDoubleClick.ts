import { useRef } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Hook that returns a trigger method that detects a double click
 * and executes callbacks for single click and double click events
 * @param {any} [timeOutSeconds] Number of seconds to delay trigger by
 * @return {JSX.Element} React Component
 */
export const useSingleAndDoubleClick = () => {
  const timeOutSeconds = 500;
  const notifyTimeout = useRef<NodeJS.Timeout>();
  const clickCount = useRef<number>(0);

  const reset = () => {
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }
    clickCount.current = 0;
  };

  const trigger = (singleClick?: any, doubleClick?: any, data?: any) => {
    clickCount.current = clickCount.current + 1;

    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }

    notifyTimeout.current = setTimeout(() => {
      if (clickCount.current === 1) {
        if (singleClick) {
          singleClick(data);
        }
      } else if (clickCount.current > 1) {
        if (doubleClick) {
          doubleClick(data);
        }
      }
      clickCount.current = 0;
    }, timeOutSeconds);
  };
  return { reset, trigger };
};
