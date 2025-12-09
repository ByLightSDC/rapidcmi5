/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
/*
This script will attempt to retrieve data from React Query cache
If it is not present in the cache, it will fetch and return it
*/

import { useEffect, useState } from 'react';

import DataFetcher from './DataFetcher';
import { useCache } from '@rangeos-nx/ui/api/hooks';

export function DataCacheOrFetcher({
  apiHook,
  loadingMessage = 'Loading...',
  payload,
  queryId,
  queryKey,
  errorMessage,
  showIndicator = true,
  shouldSuppressToaster = false,
  onDataLoad,
  onError,
}: {
  apiHook: any;
  loadingMessage?: string;
  payload: any;
  queryId?: string;
  queryKey: string;
  errorMessage?: string;
  showIndicator?: boolean;
  shouldSuppressToaster?: boolean;
  onDataLoad?: (data: Object) => void;
  onError?: (error: string) => void;
}) {
  const [shouldFetch, setShouldFetch] = useState(false);
  const queryCache = useCache();

  const handleDataLoaded = (data: any) => {
    if (onDataLoad) {
      //const id: string = queryId || payload.uuid || payload.id || '';
      // handle case where list fetched but we need to return only single record
      // need to check for NOT queryKey (may be getting sublist - example dns records under a zone)
      // and  "paging info" because some items have data as a field!

      // if (!queryId && data.totalCount && data.data && id) {
      //   let singleRecord = data.data.find((item: any) => item.uuid === id);
      //   if (singleRecord) {
      //     onDataLoad(singleRecord);
      //   } else {
      //     onDataLoad({});
      //   }
      // } else {
      onDataLoad(data);
      // }
    }
  };

  useEffect(() => {
    const id: string = queryId || payload.uuid || payload.id || '';
    if (!id) {
      return;
    }

    const isValid: boolean = queryId
      ? queryCache.getIsValid(queryKey, queryId)
      : queryCache.getIsValid(queryKey);
    const cacheData: any = queryCache.getIdFromArray(queryKey, id);

    if (isValid && cacheData) {
      handleDataLoaded(cacheData);
    } else {
      setShouldFetch(true);
    }
  }, [payload]);

  return (
    <>
      {shouldFetch && (
        <DataFetcher
          apiHook={apiHook}
          payload={payload}
          errorMessage={errorMessage || ''}
          loadingMessage={loadingMessage}
          showIndicator={showIndicator}
          shouldSuppressToaster={shouldSuppressToaster}
          onDataLoad={handleDataLoaded}
          onError={onError}
        />
      )}
    </>
  );
}

export default DataCacheOrFetcher;
