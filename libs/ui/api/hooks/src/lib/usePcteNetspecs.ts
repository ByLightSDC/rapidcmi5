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
import { PcteStandardNetspec } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyPcteNetspecs = 'pcte-netwpcs';
export const useGetPcteNetspecs = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.pcteStandardNetspecList(
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
        'An error occurred retrieving the PCTE Netspecs',
      );
    }
  };

  return useQuery(
    [queryKeyPcteNetspecs, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetPcteNetspec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.pcteStandardNetspecRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the PKI');
    }
  };

  return useQuery([queryKeyPcteNetspecs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostPcteNetspec = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: PcteStandardNetspec) => {
    try {
      const response = await DevopsApiClient.pcteStandardNetspecCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the PCTE Netspec',
      );
    }
  };

  return useMutation((formData: PcteStandardNetspec) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPcteNetspecs);
      }
    },
  });
};

export const usePutPcteNetspec = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: PcteStandardNetspec) => {
    try {
      const response = await DevopsApiClient.pcteStandardNetspecUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the PCTE Netspec',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPcteNetspecs);
      }
    },
  });
};

export const useDeletePcteNetspec = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.pcteStandardNetspecDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the PCTE Netspec',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPcteNetspecs);
      }
    },
  });
};
