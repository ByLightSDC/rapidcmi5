/* Reusable delayed fetcher using hooks

*/
import { useState } from 'react';
import { LoadingUi } from '@rangeos-nx/ui/branded';
import { useToaster } from '@rangeos-nx/ui/branded';

/* API Hooks & Types*/
import { useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { SxProps } from '@mui/system';
import { Box } from '@mui/material';

export function DataFetcher({
  apiHook,
  loadingMessage = 'Loading...',
  payload,
  errorMessage,
  showIndicator = true,
  shouldSuppressToaster = false,
  sxProps = {},
  onDataLoad,
  onError,
  onLoading,
}: {
  apiHook: any;
  loadingMessage?: string;
  payload: any;
  errorMessage?: string;
  showIndicator?: boolean;
  shouldSuppressToaster?: boolean;
  sxProps?: SxProps;
  onLoading?: (isLoading: boolean) => void;
  onDataLoad?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const query = apiHook(payload);
  const [isDataReady, setIsReady] = useState(false);
  const displayToaster = useToaster();

  useQueryDetails({
    queryObj: query,
    loaderFunction: (isLoading) => {
      setIsReady(!isLoading);
      if (onLoading) {
        onLoading(isLoading);
      }
    },

    errorFunction: (errorState: any) => {
      if (shouldSuppressToaster && errorMessage) {
        const toasterMessage =
          typeof errorState === 'string'
            ? errorState
            : ((errorMessage + `\n${errorState?.message}`) as string);

        displayToaster({
          autoHideDuration: 20000,
          message: toasterMessage,
          severity: 'error',
        });
      }
      if (onError) {
        if (!errorMessage) {
          //fallback on error message from hook
          onError(
            typeof query.error === 'string'
              ? query.error
              : query.error?.message,
          );
          return;
        }

        onError(errorMessage);
      }
    },
    shouldDisplayToaster: !shouldSuppressToaster,
    successFunction: onDataLoad,
  });

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isDataReady || !showIndicator ? (
        <div />
      ) : (
        <Box sx={sxProps}>
          <LoadingUi message={loadingMessage} />
        </Box>
      )}
    </>
  );
}

export default DataFetcher;
