import { AxiosRequestConfig } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  NetworkDevice,
  NetworkDeviceCreate,
  NetworkDeviceUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceHardwareDevices =
  'range-resource-hardware-devices';
export const useGetRangeResourceHardwareDevices = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.nodesList1(
        reqOptions?.rangeId,
        reqOptions?.offset,
        reqOptions?.limit,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Hardware Devices',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceHardwareDevices, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceHardwareDevice = ({
  rangeId,
  id,
}: {
  rangeId: string;
  id: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.nodesRetrieve(
        rangeId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Hardware Device',
      );
    }
  };

  return useQuery([queryKeyRangeResourceHardwareDevices, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeResourceHardwareDevice = ({
  rangeId,
}: {
  rangeId: string;
}) => {
  const queryClient = useQueryClient();
  const postResult = async (rangeId: string, formData: NetworkDeviceCreate) => {
    try {
      const response = await DevopsApiClient.nodesCreate(
        rangeId,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Hardware Device',
      );
    }
  };

  return useMutation(
    ({ rangeId, formData }: any) => postResult(rangeId, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceHardwareDevices);
        }
      },
    },
  );
};

export const usePutRangeResourceHardwareDevice = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    rangeId: string,
    uuid: string,
    formData: NetworkDeviceUpdate,
  ) => {
    try {
      const response = await DevopsApiClient.nodesUpdate(
        rangeId,
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Hardware Device',
      );
    }
  };

  return useMutation(
    ({ rangeId, uuid, formData }: any) => putResult(rangeId, uuid, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceHardwareDevices);
        }
      },
    },
  );
};

export const useDeleteRangeResourceHardwareDevice = ({ rangeId }: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (rangeId: string, uuid: string) => {
    try {
      const response = await DevopsApiClient.nodesDelete(
        rangeId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Hardware Device',
      );
    }
  };

  return useMutation(({ rangeId, uuid }: any) => deleteResult(rangeId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeResourceHardwareDevices);
      }
    },
  });
};
