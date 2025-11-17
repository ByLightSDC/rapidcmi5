/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';

import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
  getMetadataFilterParam,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceClusterNetworks =
  'range-resource-cluster-networks';
export const useGetRangeResourceClusterNetworks = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.clusterRangeNetworksListByRangeId(
        reqOptions?.rangeId,
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
    [queryKeyRangeResourceClusterNetworks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceClusterNetwork = ({
  rangeId,
  uuid,
}: {
  rangeId: string;
  uuid: string;
}) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.clusterRangeNetworksRetrieveByRangeIdUuid(
          rangeId,
          uuid,
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

  return useQuery([queryKeyRangeResourceClusterNetworks, uuid], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteRangeResourceClusterNetwork = ({ rangeId }: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (rangeId: string, uuid: string) => {
    try {
      const response =
        await DevopsApiClient.clusterRangeNetworksDeleteByRangeIdUuid(
          rangeId,
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

  return useMutation(({ rangeId, uuid }: any) => deleteResult(rangeId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeResourceClusterNetworks);
      }
    },
  });
};
