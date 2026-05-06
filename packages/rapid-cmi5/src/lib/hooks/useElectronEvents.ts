import { useEffect } from 'react';

export function useElectronEvent<T>(
  channel: string,
  handler: (data: T) => void,
) {
  useEffect(() => {
    const unsubscribe = window.electronEvents?.on(channel, handler);

    return () => {
      unsubscribe?.();
    };
  }, [channel, handler]);
}
