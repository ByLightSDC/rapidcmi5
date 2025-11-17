/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef } from 'react';

/**
 * Hook that returns a trigger method to run after a specified number of seconds
 * @param {any} [timeOutSeconds] Number of seconds to delay trigger by
 * @return {JSX.Element} React Component
 */
export const useSaveTimer = ({
  timeOutSeconds = 250,
}: {
  timeOutSeconds: number;
}) => {
  const notifyTimeout = useRef<NodeJS.Timeout>();

  const clearTrigger = () => {
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }
  };

  const trigger = (callbackHandler?: any, data?: any) => {
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }

    notifyTimeout.current = setTimeout(() => {
      callbackHandler(data);
    }, timeOutSeconds);
  };
  return { clearTrigger, trigger };
};
