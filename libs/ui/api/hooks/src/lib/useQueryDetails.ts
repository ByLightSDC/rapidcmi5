import { useEffect } from 'react';
import { useToaster } from '@rangeos-nx/ui/branded';

export const formatQueryError = (queryError: any) => {
  //Post, Put, and Delete throw error objects
  //Get throw error strings
  const titleMessage = queryError?.defaultMessage;
  let detailMessage = queryError?.statusText || queryError?.message || '';
  //fix duplicated error display
  if (titleMessage?.indexOf(detailMessage) >= 0) {
    detailMessage = '';
  }
  //Handle both
  return typeof queryError === 'string'
    ? queryError
    : ((titleMessage + `\n${detailMessage}`) as string);

  //REF return 'Test \n line Breaks';
};

/* Custom hook for handling react query loading state, success and error handlers*/
export const useQueryDetails = ({
  queryObj,
  loaderFunction = null,
  successFunction = null,
  errorFunction = null,
  shouldDisplayToaster = true,
}: {
  queryObj: any;
  loaderFunction?: null | ((loadingState: boolean) => void);
  successFunction?: null | ((successData: any) => void);
  errorFunction?: null | ((errorState: boolean) => void);
  shouldDisplayToaster?: boolean;
}): void => {
  const displayToaster = useToaster();

  useEffect(() => {
    if (loaderFunction) {
      loaderFunction(queryObj.isLoading || queryObj.isFetching);
    }
  }, [queryObj.isLoading, queryObj.isFetching, loaderFunction]);

  useEffect(() => {
    //REF if (!queryObj.isLoading && !queryObj.isSuccess && queryObj.error !== null) {
    if (queryObj.error !== null) {
      if (errorFunction) {
        errorFunction(queryObj.error);
      }
      if (shouldDisplayToaster) {
        const toasterMessage = formatQueryError(queryObj.error);

        displayToaster({
          autoHideDuration: 20000,
          message: toasterMessage,
          severity: 'error',
        });
      }
    }
  }, [queryObj.error, queryObj.isLoading, queryObj.isSuccess]);

  useEffect(() => {
    const isReady =
      queryObj &&
      queryObj.isSuccess &&
      queryObj.data &&
      (queryObj.isFetching ? queryObj.isFetched : !queryObj.isLoading);

    if (isReady) {
      if (successFunction) {
        successFunction(queryObj.data);
      }
    }
  }, [queryObj.isSuccess, queryObj.data]); //react query state can go from success to success when data is invalidated so you need to also detect data change
};
