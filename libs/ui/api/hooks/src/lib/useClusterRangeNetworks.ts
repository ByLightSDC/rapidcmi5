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
  ClusterRangeNetwork,
  ClusterRangeNetworkCreate,
  ClusterRangeNetworkUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyClusterRangeNetworks = 'cluster-range-networks';
export const useGetClusterRangeNetworks = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.clusterRangeNetworksList(
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
        'An error occurred retrieving the Cluster Networks',
      );
    }
  };

  return useQuery(
    [queryKeyClusterRangeNetworks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
      ...reqOptions?.queryConfig,
    },
  );
};

export const useGetClusterRangeNetwork = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.clusterRangeNetworksRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Cluster Network',
      );
    }
  };

  return useQuery([queryKeyClusterRangeNetworks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostClusterRangeNetwork = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: ClusterRangeNetworkCreate) => {
    try {
      const response = await DevopsApiClient.clusterRangeNetworksCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Cluster Network',
      );
    }
  };

  return useMutation(
    (formData: ClusterRangeNetworkCreate) => postResult(formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyClusterRangeNetworks);
        }
      },
    },
  );
};

export const usePutClusterRangeNetwork = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    uuid: string,
    formData: ClusterRangeNetworkUpdate,
  ) => {
    try {
      const response = await DevopsApiClient.clusterRangeNetworksUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Cluster Network',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyClusterRangeNetworks);
      }
    },
  });
};

export const useDeleteClusterRangeNetwork = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.clusterRangeNetworksDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Cluster Network',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyClusterRangeNetworks);
      }
    },
  });
};
