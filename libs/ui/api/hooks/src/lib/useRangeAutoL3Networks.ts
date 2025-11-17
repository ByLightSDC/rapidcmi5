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
  RangeAutoL3Network,
  RangeAutoL3NetworkCreate,
  RangeAutoL3NetworkUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeAutoL3Networks = 'range-l3networks';
export const useGetRangeAutoL3Networks = (reqOptions?: any) => {
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
      //uuid, name, description, author, cidr, offset, limit, search, sortBy, sort, options
      const response = await DevopsApiClient.rangeAutoL3NetworksList(
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
    [queryKeyRangeAutoL3Networks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeAutoL3Network = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeAutoL3NetworksRetrieve(
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

  return useQuery([queryKeyRangeAutoL3Networks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeAutoL3Network = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeAutoL3NetworkCreate) => {
    try {
      const response = await DevopsApiClient.rangeAutoL3NetworksCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the IP Subnet');
    }
  };

  return useMutation(
    (formData: RangeAutoL3NetworkCreate) => postResult(formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeAutoL3Networks);
        }
      },
    },
  );
};

export const usePutRangeAutoL3Network = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    uuid: string,
    formData: RangeAutoL3NetworkUpdate,
  ) => {
    try {
      const response = await DevopsApiClient.rangeAutoL3NetworksUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the IP Subnet');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeAutoL3Networks);
      }
    },
  });
};

export const useDeleteRangeAutoL3Network = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeAutoL3NetworksDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the IP Subnet');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyRangeAutoL3Networks);
      }
    },
  });
};
