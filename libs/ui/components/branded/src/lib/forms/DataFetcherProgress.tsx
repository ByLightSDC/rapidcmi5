/*
DataFetcher can load data and return progress 
Created for use with downloading blobs

This specifically solves an issue where the file system dialog pops twice for a single download
React Query calls loaded useEffect multiple times (for unknown reason) 
To remedy, this class creates a timer and checks elapsed time between success calls
And ignores those too close together

API hooks to be used with this class must return both percentComplete and query

Note that passing onError function causes error to be captured before useQueryDetails hook can display a toaster
*/

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

/* Redux */
import { setLoader } from '@rangeos-nx/ui/redux';
/* API Hooks & Types*/
import { useQueryDetails } from '@rangeos-nx/ui/api/hooks';

//Reusable delayed fetcher using hooks
export function DataFetcherProgress({
  apiHook,
  payload,
  errorMessage,
  shouldSuppressToaster = false,
  onDataLoad,
  onDataProgress,
  onDataError,
}: {
  apiHook: any;
  payload: any;
  errorMessage: string;
  shouldSuppressToaster?: boolean;
  onDataLoad?: (data: Object) => void;
  onDataProgress?: (data: number) => void;
  onDataError?: (error: string) => void;
}) {
  const dispatch = useDispatch();
  const { query, percentComplete } = apiHook(payload);

  const timerRef = useRef<number>(0);

  useQueryDetails({
    queryObj: query,
    loaderFunction: (isLoading) => {
      dispatch(setLoader(isLoading));
    },
    errorFunction: (errorState) => {
      // no toaster - alert handled separately
    },
    shouldDisplayToaster: !shouldSuppressToaster,
  });

  useEffect(() => {
    timerRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!query.isFetching && query.isSuccess && query.data) {
      const ms = Date.now();
      if (ms - timerRef.current > 20) {
        if (onDataLoad) {
          onDataLoad(query.data);
        }
      } else {
        //
      }
      timerRef.current = ms;
    }
  }, [query.isFetching]);

  useEffect(() => {
    if (query.error) {
      if (onDataError) {
        if (!errorMessage) {
          onDataError(
            typeof query.error === 'string'
              ? query.error
              : query.error?.message,
          );
          return;
        }
        onDataError(errorMessage);
      }
    }
  }, [query.error]);

  useEffect(() => {
    if (onDataProgress) {
      onDataProgress(percentComplete);
    }
  }, [percentComplete]);

  return null;
}

export default DataFetcherProgress;
