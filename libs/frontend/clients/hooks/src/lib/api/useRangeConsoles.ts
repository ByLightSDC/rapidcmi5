import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  DevopsApiClient,
  RangeConsole,
  RangeConsoleCreate,
  RangeConsoleUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeConsoles = 'range-consoles';
export const useGetRangeConsoles = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeConsolesList(
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
      throw getErrorMessage(error, 'An error occurred retrieving the Consoles');
    }
  };

  return useQuery(
    [queryKeyRangeConsoles, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
      ...reqOptions?.queryConfig,
    },
  );
};

export const useGetRangeConsole = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeConsolesRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Console');
    }
  };

  return useQuery([queryKeyRangeConsoles, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeConsole = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeConsoleCreate) => {
    try {
      const response = await DevopsApiClient.rangeConsolesCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Console');
    }
  };

  return useMutation((formData: RangeConsoleCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeConsoles);
      }
    },
  });
};

export const usePutRangeConsole = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: RangeConsoleUpdate) => {
    try {
      const response = await DevopsApiClient.rangeConsolesUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Console');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeConsoles);
      }
    },
  });
};

export const useDeleteRangeConsole = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeConsolesDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Console');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyRangeConsoles);
      }
    },
  });
};
