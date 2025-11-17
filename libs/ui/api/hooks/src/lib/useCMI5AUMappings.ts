/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  Cmi5AuMappingCreate,
  Cmi5AuMappingUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyCMI5AuMappings = 'cmi5-au-mappings';

/**
 * list
 * @param reqOptions
 * @returns
 */
export const useGetAuMappings = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.cmi5AuMappingList(
        reqOptions?.author,
        reqOptions?.dateCreated,
        reqOptions?.dateEdited,
        reqOptions?.name,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving AU Mappings');
    }
  };

  return useQuery(
    [queryKeyCMI5AuMappings, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

/**
 * retrieve
 * @param param0
 * @returns
 */
export const useGetAUMapping = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.cmi5AuMappingRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the AU Mapping',
      );
    }
  };

  return useQuery([queryKeyCMI5AuMappings, id], getResult, {
    ...defaultQueryConfig,
  });
};

/**
 * create
 * @returns
 */
export const usePostAUMapping = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: Cmi5AuMappingCreate) => {
    try {
      const response = await DevopsApiClient.cmi5AuMappingCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the AU Mapping');
    }
  };

  return useMutation((formData: Cmi5AuMappingCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCMI5AuMappings);
      }
    },
  });
};

/**
 * update
 * @returns
 */
export const usePutAUMapping = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: Cmi5AuMappingUpdate) => {
    try {
      const response = await DevopsApiClient.cmi5AuMappingUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the AU Mapping');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCMI5AuMappings);
      }
    },
  });
};

/**
 * delete
 * @returns
 */
export const useDeleteAUMapping = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.cmi5AuMappingDelete(
        decodeURIComponent(uuid),
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the AU Mapping');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCMI5AuMappings);
      }
    },
  });
};
