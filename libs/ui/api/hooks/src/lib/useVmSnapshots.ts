import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyVmSnapshots = 'vm-snapshots';
export const useGetVmSnapshots = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.virtualMachineSnapshotsRetrieve(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.vmId,
        reqOptions?.search,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.sortBy || 'creationTimestamp',
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the VM Snapshots',
      );
    }
  };

  return useQuery(
    [queryKeyVmSnapshots, reqOptions],
    () => getResult(reqOptions),
    {
      ...config,
      keepPreviousData: true,
    },
  );
};

export const usePostVmSnapshot = () => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    vmId: string,
  ) => {
    try {
      const response = await DevopsApiClient.virtualMachineSnapshotsCreate(
        rangeId,
        scenarioId,
        vmId,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the VM Snapshot',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, vmId }: any) =>
      postResult(rangeId, scenarioId, vmId),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmSnapshots);
        }
      },
    },
  );
};

export const useDeleteVmSnapshot = ({
  rangeId,
  scenarioId,
  vmId,
  uuid, // the snapshotname
}: any) => {
  const queryClient = useQueryClient();

  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    vmId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.virtualMachineSnapshotsDelete(
        rangeId,
        scenarioId,
        vmId,
        uuid,
        queryHooksConfig,
      );
      return response;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the VM Snapshot',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, vmId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, vmId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmSnapshots);
        }
      },
    },
  );
};
