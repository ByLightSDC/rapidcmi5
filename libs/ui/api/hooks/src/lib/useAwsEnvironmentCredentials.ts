/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyAwsEnvironmentCreds = 'aws-environment-credentials';

export const useGetAwsEnvironmentCredentials = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      const response = await DevopsApiClient.environmentAwsCredentialList(
        reqOptions?.name,
        reqOptions?.author,
        reqOptions?.description,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the AWS Environment Credentials',
      );
    }
  };

  return useQuery(
    [queryKeyAwsEnvironmentCreds, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetAwsEnvironmentCredential = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.environmentAwsCredentialRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the AWS Environment Credential',
      );
    }
  };

  return useQuery([queryKeyAwsEnvironmentCreds, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostAwsEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: any) => {
    try {
      const response = await DevopsApiClient.environmentAwsCredentialCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the AWS Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAwsEnvironmentCreds);
      }
    },
  });
};

export const usePutAwsEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const putResult = async (data: any) => {
    try {
      const response = await DevopsApiClient.environmentAwsCredentialUpdate(
        data.uuid,
        data.formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the AWS Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAwsEnvironmentCreds);
      }
    },
  });
};

export const useDeleteAwsEnvironmentCredential = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.environmentAwsCredentialDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the AWS Environment Credential',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyAwsEnvironmentCreds);
      }
    },
  });
};
