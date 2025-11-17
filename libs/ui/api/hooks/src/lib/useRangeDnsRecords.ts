/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
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
  RangeDnsRecordCreate,
  RangeDnsRecordUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeDnsRecords = 'range-dns-records';

export const useGetRangeDnsRecords = (reqOptions?: any) => {
  const getResult = async () => {
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
      const response = await DevopsApiClient.rangeDnsRecordsList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.rangeDNSZone || undefined,
        reqOptions?.recordClass,
        reqOptions?.type,
        reqOptions?.data,
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
        'An error occurred retrieving the DNS Records',
      );
    }
  };

  //queryKey does not currently support paging
  return useQuery([queryKeyRangeDnsRecords, reqOptions], getResult, {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetRangeDnsRecordsByZone = (reqOptions?: any) => {
  const queryKeyId = reqOptions?.rangeDNSZone || 'todo';
  const getResult = async () => {
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

      const response = await DevopsApiClient.rangeDnsRecordsList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.rangeDNSZone || undefined,
        reqOptions?.recordClass,
        reqOptions?.type,
        reqOptions?.data,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ??
        'An error occurred retrieving the DNS Records'
      );
    }
  };

  //queryKey does not currently support paging
  // store results by zone id (queryKeyId) in dns records cache
  // so it can be retrieved by either by zone or by individual dns record (nested)
  return useQuery([queryKeyRangeDnsRecords, queryKeyId], getResult, {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetRangeDnsRecord = ({
  id,
  rangeDNSZone,
}: {
  id: string;
  rangeDNSZone?: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeDnsRecordsRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the DNS Record',
      );
    }
  };

  return useQuery([queryKeyRangeDnsRecords, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeDnsRecord = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeDnsRecordCreate) => {
    try {
      const response = await DevopsApiClient.rangeDnsRecordsCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the DNS Record');
    }
  };

  return useMutation((formData: RangeDnsRecordCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error && variables.rangeDNSZone) {
        queryClient.invalidateQueries([
          queryKeyRangeDnsRecords,
          variables.rangeDNSZone,
        ]);
      }
    },
  });
};

export const usePutRangeDnsRecord = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: RangeDnsRecordUpdate) => {
    try {
      const response = await DevopsApiClient.rangeDnsRecordsUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the DNS Record');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (variables.formData?.rangeDNSZone) {
          queryClient.invalidateQueries([
            queryKeyRangeDnsRecords,
            variables.formData?.rangeDNSZone,
          ]);
        }
        if (variables.uuid) {
          queryClient.invalidateQueries([
            queryKeyRangeDnsRecords,
            variables.uuid,
          ]);
        }
      }
    },
  });
};

export const useDeleteRangeDnsRecord = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeDnsRecordsDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the DNS Record');
    }
  };

  return useMutation(({ uuid, rangeDnsZone }: any) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (variables.rangeDnsZone) {
          queryClient.invalidateQueries([
            queryKeyRangeDnsRecords,
            variables.rangeDnsZone,
          ]);
        }
        if (variables.uuid) {
          queryClient.invalidateQueries([
            queryKeyRangeDnsRecords,
            variables.uuid,
          ]);
        }
      }
    },
  });
};
