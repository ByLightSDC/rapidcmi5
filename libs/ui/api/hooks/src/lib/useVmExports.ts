import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import {
  DevopsApiClient,
  RangeVmExportForm,
} from '@rangeos-nx/frontend/clients/devops-api';
import { authToken } from '@rangeos-nx/ui/keycloak';

import { getErrorMessage } from './errorMessages';

export const queryKeyVmExports = 'vm-exports';

export const usePostVmExport = () => {
  const queryClient = useQueryClient();
  const authTokenSel = useSelector(authToken);

  const postResult = async (
    rangeId: string,
    scenarioId: string,
    exportData: RangeVmExportForm,
  ) => {
    try {
      // special header authorization format needed for this api call
      const options = {
        headers: {
          Authorization: `Bearer ${authTokenSel}`,
        },
      };

      const response = await DevopsApiClient.rangeVmExportsCreate(
        rangeId,
        scenarioId,
        exportData,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred Exporting the VM');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, exportData }: any) =>
      postResult(rangeId, scenarioId, exportData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmExports);
        }
      },
    },
  );
};
