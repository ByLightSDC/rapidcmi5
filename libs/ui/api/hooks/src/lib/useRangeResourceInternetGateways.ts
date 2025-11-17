/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
  getMetadataFilterParam,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceInternetGateways =
  'range-resource-internet-gateways';
export const useGetRangeResourceInternetGateways = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.deployedInternetGatewaysList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
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
        'An error occurred retrieving the Internet Gateways',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceInternetGateways, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceInternetGateway = ({
  rangeId,
  scenarioId,
  id,
}: {
  rangeId: string;
  scenarioId: string;
  id: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.deployedInternetGatewaysRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Internet Gateway',
      );
    }
  };

  return useQuery([queryKeyRangeResourceInternetGateways, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteRangeResourceInternetGateway = ({
  rangeId,
  scenarioId,
}: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.deployedInternetGatewaysDelete(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Internet Gateway',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceInternetGateways);
        }
      },
    },
  );
};
