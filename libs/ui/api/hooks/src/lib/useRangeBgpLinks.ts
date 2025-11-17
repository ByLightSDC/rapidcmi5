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
  RangeBGPLink,
  RangeBgpLinkCreate,
  RangeBgpLinkUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeBGPLinks = 'range-bgp-links';
export const useGetRangeBgpLinks = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeBgpLinksList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.node1,
        reqOptions?.node1ASN,
        reqOptions?.node2,
        reqOptions?.node2ASN,
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
        'An error occurred retrieving the BGP Links',
      );
    }
  };

  return useQuery(
    [queryKeyRangeBGPLinks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeBgpLink = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeBgpLinksRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the BGP Link');
    }
  };

  return useQuery([queryKeyRangeBGPLinks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeBgpLink = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeBgpLinkCreate) => {
    try {
      const response = await DevopsApiClient.rangeBgpLinksCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the BGP Link');
    }
  };

  return useMutation((formData: RangeBgpLinkCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeBGPLinks);
      }
    },
  });
};

export const usePutRangeBgpLink = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: RangeBgpLinkUpdate) => {
    try {
      const response = await DevopsApiClient.rangeBgpLinksUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the BGP Link');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyRangeBGPLinks);
      }
    },
  });
};

export const useDeleteRangeBgpLink = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeBgpLinksDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the BGP Link');
    }
  };

  return useMutation((uuid: any) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyRangeBGPLinks);
      }
    },
  });
};
