/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  EnvironmentAwsCreate,
  EnvironmentAwsUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyEnvironments = 'environments';

export const useGetEnvironments = (reqOptions?: any) => {
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
      const response = await DevopsApiClient.environmentAwsList(
        reqOptions?.name,
        reqOptions?.awsAvailabilityZone,
        reqOptions?.awsRegion,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving Environments');
    }
  };
  return useQuery(
    [queryKeyEnvironments, reqOptions],
    () => getResult(reqOptions),
    {
      ...config,
      keepPreviousData: true,
    },
  );
};

export const useGetEnvironment = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.environmentAwsRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Environment',
      );
    }
  };

  return useQuery([queryKeyEnvironments, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostEnvironment = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: EnvironmentAwsCreate) => {
    try {
      const response = await DevopsApiClient.environmentAwsCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Environment',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEnvironments);
      }
    },
  });
};

export const usePutEnvironment = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: EnvironmentAwsUpdate) => {
    try {
      const response = await DevopsApiClient.environmentAwsUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Environment',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEnvironments);
      }
    },
  });
};

export const useDeleteEnvironment = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.environmentAwsDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Environment',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEnvironments);
      }
    },
  });
};
