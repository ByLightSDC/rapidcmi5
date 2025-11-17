/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  NetworkOverride,
  NetworkOverrideCreate,
  NetworkOverrideUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyNetworkOverrides = 'network-overrides';
export const useGetNetworkOverrides = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.networkOverrideList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
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
        'An error occurred retrieving the Ghost Traffic List',
      );
    }
  };

  return useQuery(
    [queryKeyNetworkOverrides, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
      ...reqOptions?.queryConfig,
    },
  );
};

export const useGetNetworkOverride = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.networkOverrideRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ghost Traffic',
      );
    }
  };

  return useQuery([queryKeyNetworkOverrides, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostNetworkOverride = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: NetworkOverrideCreate) => {
    try {
      const response = await DevopsApiClient.networkOverrideCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Ghost Traffic',
      );
    }
  };

  return useMutation(
    (formData: NetworkOverrideCreate) => postResult(formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyNetworkOverrides);
        }
      },
    },
  );
};

export const usePutNetworkOverride = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: NetworkOverrideUpdate) => {
    try {
      const response = await DevopsApiClient.networkOverrideUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Ghost Traffic',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyNetworkOverrides);
      }
    },
  });
};

export const useDeleteNetworkOverride = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.networkOverrideDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Ghost Traffic',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyNetworkOverrides);
      }
    },
  });
};
