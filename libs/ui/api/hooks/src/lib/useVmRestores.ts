import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyVmRestores = 'vm-restores';
export const useGetVmRestores = (reqOptions?: any) => {
  const config = {
    ...defaultQueryConfig,
    refetchInterval: reqOptions?.shouldPoll || false,
  };

  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      const response = await DevopsApiClient.virtualMachineRestoresList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.vmId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || 'creationTimestamp',
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the VM Restores',
      );
    }
  };

  return useQuery(
    [queryKeyVmRestores, reqOptions],
    () => getResult(reqOptions),
    {
      ...config,
      keepPreviousData: true,
    },
  );
};

export const usePostVmSnapshotRestore = () => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    vmId: string,
    snapshotName: string,
  ) => {
    try {
      const response = await DevopsApiClient.virtualMachineRestoresCreate(
        rangeId,
        scenarioId,
        vmId,
        snapshotName,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the VM Restore');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, vmId, snapshotName }: any) =>
      postResult(rangeId, scenarioId, vmId, snapshotName),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmRestores);
        }
      },
    },
  );
};

export const useDeleteVmRestore = ({
  rangeId,
  scenarioId,
  vmId,
  uuid, // the restoreName
}: any) => {
  const queryClient = useQueryClient();

  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    vmId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.virtualMachineRestoresDelete(
        rangeId,
        scenarioId,
        vmId,
        uuid,
        queryHooksConfig,
      );
      return response;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the VM Restore');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, vmId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, vmId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmRestores);
        }
      },
    },
  );
};
