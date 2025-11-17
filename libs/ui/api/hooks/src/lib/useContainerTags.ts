/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

import { queryKeyContainers } from './useContainers';
export const queryKeyContainerTags = 'container-tags';

export const useGetContainerTags = (name: string) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.containerTagsList(
        name,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred retrieving the Container Tags for ${name}`,
      );
    }
  };

  return useQuery([queryKeyContainerTags, name], getResult, {
    ...defaultQueryConfig,
  });
};

//No PUT available for container tags

export const useDeleteContainerTag = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (formData: any) => {
    try {
      const response = await DevopsApiClient.containerTagsDelete(
        formData.name,
        formData.tag,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Container Tag',
      );
    }
  };

  return useMutation((formData: any) => deleteResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyContainers);
        queryClient.invalidateQueries(queryKeyContainerTags);
      }
    },
  });
};
