import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
  getMetadataFilterParam,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceVMs = 'range-resource-vms';
export const useGetRangeResourceVMs = (reqOptions?: any) => {
  const config = {
    ...defaultQueryConfig,
    refetchInterval: reqOptions?.shouldPoll || false,
  };

  const getResult = async (reqOptions?: any) => {
    try {
      const metadata = getMetadataFilterParam(reqOptions);
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        params: { metadata },
        paramsSerializer(params) {
          return qs.stringify(params);
        },
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.deployedRangeVMsList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.running,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the VMs');
    }
  };

  return useQuery(
    [queryKeyRangeResourceVMs, reqOptions],
    () => getResult(reqOptions),
    {
      ...config,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceVM = ({
  rangeId,
  scenarioId,
  id,
}: {
  rangeId: string;
  scenarioId: string;
  id: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.deployedRangeVMsRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the VM');
    }
  };

  return useQuery([queryKeyRangeResourceVMs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostStopRangeResourceVM = ({ rangeId, scenarioId }: any) => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.deployedRangeVMsStop(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred stoping the VM');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceVMs);
        }
      },
    },
  );
};

export const usePostStartRangeResourceVM = ({ rangeId, scenarioId }: any) => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.deployedRangeVMsStart(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred starting the VM');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceVMs);
        }
      },
    },
  );
};

export const usePostRebootRangeResourceVM = ({ rangeId, scenarioId }: any) => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      // Reboot is really a matter of stopping and THEN starting the VM - so call those two endpoints in sequence
      let response = await DevopsApiClient.deployedRangeVMsStop(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      response = await DevopsApiClient.deployedRangeVMsStart(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred rebooting the VM');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceVMs);
        }
      },
    },
  );
};

export const useDeleteRangeResourceVM = ({ rangeId, scenarioId }: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.deployedRangeVMsDelete(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the VM');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceVMs);
        }
      },
    },
  );
};
