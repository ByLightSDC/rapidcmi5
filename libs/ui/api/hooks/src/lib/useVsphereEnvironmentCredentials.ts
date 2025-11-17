/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  EnvironmentCredentialVsphereCreate,
  EnvironmentCredentialVsphereUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyVsphereEnvironmentCreds =
  'vsphere-environment-credentials';

export const useGetVsphereEnvironmentCredentials = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      const response = await DevopsApiClient.environmentVsphereCredentialList(
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
        'An error occurred retrieving the vSphere Environment Credentials',
      );
    }
  };

  return useQuery(
    [queryKeyVsphereEnvironmentCreds, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetVsphereEnvironmentCredential = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.environmentVsphereCredentialRetrieve(
          id,
          queryHooksConfig,
        );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the vSphere Environment Credential',
      );
    }
  };

  return useQuery([queryKeyVsphereEnvironmentCreds, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostVsphereEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: EnvironmentCredentialVsphereCreate) => {
    try {
      const response = await DevopsApiClient.environmentVsphereCredentialCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the vSphere Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVsphereEnvironmentCreds);
      }
    },
  });
};

export const usePutVsphereEnvironmentCredential = () => {
  const queryClient = useQueryClient();
  const putResult = async (data: any) => {
    try {
      const response = await DevopsApiClient.environmentVsphereCredentialUpdate(
        data.uuid,
        data.formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the vSphere Environment Credential',
      );
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVsphereEnvironmentCreds);
      }
    },
  });
};

export const useDeleteVsphereEnvironmentCredential = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.environmentVsphereCredentialDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the vSphere Environment Credential',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyVsphereEnvironmentCreds);
      }
    },
  });
};
