import React from 'react';

// React18 StrictMode introduced useEffect running twice in development mode
// Use this hook as a work around
export const useEffectOnce = (callback: any, when: any) => {
  const hasRunOnce = React.useRef(false);
  React.useEffect(() => {
    if (when && !hasRunOnce.current) {
      callback();
      hasRunOnce.current = true;
    }
  }, [when]);
};
