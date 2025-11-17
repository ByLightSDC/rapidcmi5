/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  RangeCreate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import { RangeUpdate } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRanges = 'ranges';

export const useGetRanges = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeList(
        reqOptions?.author,
        reqOptions?.name,
        reqOptions?.specification,
        reqOptions?.uuid,
        reqOptions?.status,
        reqOptions?.message,
        undefined, // cmi5Key
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Ranges');
    }
  };

  return useQuery([queryKeyRanges, reqOptions], () => getResult(reqOptions), {
    ...config,
    keepPreviousData: true,
  });
};

export const usePostRange = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeCreate) => {
    try {
      const response = await DevopsApiClient.rangeCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deploying the Range');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRanges);
      }
    },
  });
};

export const useGetRange = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Range');
    }
  };

  return useQuery([queryKeyRanges, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePutRange = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: RangeUpdate) => {
    try {
      const response = await DevopsApiClient.rangeUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Range');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRanges);
      }
    },
  });
};

export const useDeleteRange = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Range');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRanges);
      }
    },
  });
};
