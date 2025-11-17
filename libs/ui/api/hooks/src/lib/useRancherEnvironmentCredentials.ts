/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  EnvironmentCredentialRancherCreate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRancherEnvironmentCreds =
  'rancher-environment-credentials';

export const useGetRancherEnvironmentCredentials = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      const response = await DevopsApiClient.environmentRancherCredentialList(
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
        'An error occurred retrieving the Rancher Environment Credentials',
      );
    }
  };

  return useQuery(
    [queryKeyRancherEnvironmentCreds, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRancherEnvironmentCredential = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.environmentRancherCredentialRetrieve(
          id,
          queryHooksConfig,
        );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Rancher Environment Credential',
      );
    }
  };

  return useQuery([queryKeyRancherEnvironmentCreds, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRancherEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: EnvironmentCredentialRancherCreate) => {
    try {
      const response = await DevopsApiClient.environmentRancherCredentialCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Rancher Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRancherEnvironmentCreds);
      }
    },
  });
};

export const usePutRancherEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const putResult = async (data: any) => {
    try {
      const response = await DevopsApiClient.environmentRancherCredentialUpdate(
        data.uuid,
        data.formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Rancher Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRancherEnvironmentCreds);
      }
    },
  });
};

export const useDeleteRancherEnvironmentCredential = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.environmentRancherCredentialDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Rancher Environment Credential',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyRancherEnvironmentCreds);
      }
    },
  });
};
