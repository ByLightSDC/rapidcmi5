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
  RangeNetwork,
  RangeNetworkCreate,
  RangeNetworkUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeNetworks = 'range-networks';
export const useGetRangeNetworks = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeNetworksList(
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
      throw getErrorMessage(error, 'An error occurred retrieving the Networks');
    }
  };

  return useQuery(
    [queryKeyRangeNetworks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
      ...reqOptions?.queryConfig,
    },
  );
};

export const useGetRangeNetwork = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeNetworksRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Network');
    }
  };

  return useQuery([queryKeyRangeNetworks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeNetwork = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeNetworkCreate) => {
    try {
      const response = await DevopsApiClient.rangeNetworksCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Network');
    }
  };

  return useMutation((formData: RangeNetworkCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeNetworks);
      }
    },
  });
};

export const usePutRangeNetwork = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: RangeNetworkUpdate) => {
    try {
      const response = await DevopsApiClient.rangeNetworksUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Network');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeNetworks);
      }
    },
  });
};

export const useDeleteRangeNetwork = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeNetworksDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Network');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyRangeNetworks);
      }
    },
  });
};
