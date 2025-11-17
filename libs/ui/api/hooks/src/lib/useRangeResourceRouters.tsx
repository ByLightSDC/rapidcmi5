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

export const queryKeyRangeResourceRouters = 'range-resource-routers';
export const useGetRangeResourceRouters = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.deployedRangeRoutersList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.countryCode,
        reqOptions?.hostName,
        reqOptions?.protocol,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Routers');
    }
  };

  return useQuery(
    [queryKeyRangeResourceRouters, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceRouter = ({
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
      const response = await DevopsApiClient.deployedRangeRoutersRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Router');
    }
  };

  return useQuery([queryKeyRangeResourceRouters, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteRangeResourceRouter = ({ rangeId, scenarioId }: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.deployedRangeRoutersDelete(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Router');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceRouters);
        }
      },
    },
  );
};
