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

export const queryKeyRangeResourceL3Networks = 'range-resource-l3networks';
export const useGetRangeResourceL3Networks = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.deployedRangeL3NetworksList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.cidr,
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
        'An error occurred retrieving the IP Subnets',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceL3Networks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceL3Network = ({
  rangeId,
  scenarioId,
  id,
  subDomain,
}: {
  rangeId: string;
  scenarioId: string;
  id: string;
  subDomain?: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.deployedRangeL3NetworksRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the IP Subnet',
      );
    }
  };

  return useQuery([queryKeyRangeResourceL3Networks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteRangeResourceL3Network = ({
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
      const response = await DevopsApiClient.deployedRangeL3NetworksDelete(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the IP Subnet');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceL3Networks);
        }
      },
    },
  );
};
