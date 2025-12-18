/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rapid-cmi5/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import { tContainerCreate } from '@rapid-cmi5/frontend/clients/devops-api';

export const queryKeyContainers = 'containers';

export const useGetContainers = (reqOptions?: any) => {
  const options = {
    ...queryHooksConfig,
    authToken: reqOptions?.authToken,
  };

  const getResult = async (reqOptions?: any) => {
    try {
      const response = await DevopsApiClient.containersList(
        reqOptions?.name,
        reqOptions?.tag,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        'name', //reqOptions?.sortBy || defaultSortOrderBy, // currently only sort by name
        reqOptions?.sort || 'asc', //defaultSortOrder
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Containers',
      );
    }
  };

  return useQuery(
    [queryKeyContainers, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const usePostContainer = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: tContainerCreate) => {
    try {
      const configWithProgress = {
        ...queryHooksConfig,
        onUploadProgress: formData.onUploadProgress,
      };

      const response = await DevopsApiClient.containersCreate(
        formData.file as unknown as File,
        formData.tag,
        formData.name,
        formData.onUploadProgress ? configWithProgress : queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Container');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyContainers);
      }
    },
  });
};

export const useDeleteContainer = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.containersDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Container');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyContainers);
      }
    },
  });
};
