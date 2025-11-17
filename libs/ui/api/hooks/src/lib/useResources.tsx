import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { config } from '@rangeos-nx/frontend/environment';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { Resource } from './types';
import { getErrorMessage } from './errorMessages';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;
const topic = 'resource';
export const queryKeyResources = 'resources';

export const useGetResources = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await axios.get<Resource>(`${baseUrl}/resource`);
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ?? 'An error occurred retrieving Resources'
      );
    }

    // try {
    //   const options = {
    //     ...queryHooksConfig,
    //     authToken: reqOptions?.authToken,
    //   };

    //   const response = await DevopsApiClient.rangeBgPsList(
    //     reqOptions?.uuid,
    //     reqOptions?.name,
    //     reqOptions?.description,
    //     reqOptions?.author,
    //     reqOptions?.asn,
    //     reqOptions?.rangeRouter,
    //     reqOptions?.offset,
    //     reqOptions?.limit,
    //     reqOptions?.search,
    //     reqOptions?.sortBy || defaultSortOrderBy,
    //     reqOptions?.sort || defaultSortOrder,
    //     options
    //   );

    //   return response.data;
    // } catch (error: any) {
    //   throw error.response?.data?.msg ?? 'An error occurred retrieving Resources';
    // }
  };

  return useQuery(
    [queryKeyResources, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetResource = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<Resource>(`${baseUrl}/${topic}/${id}`);
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ?? 'An error occurred retrieving the Resource'
      );
    }
  };

  return useQuery([queryKeyResources, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostResource = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: any) => {
    try {
      const response = await axios.post<Resource>(`${baseUrl}/${topic}/`);
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Resource');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyResources);
      }
    },
  });
};

export const usePutResource = () => {
  const queryClient = useQueryClient();
  const putResult = async (formData: any) => {
    try {
      const response = await axios.put<Resource>(
        `${baseUrl}/${topic}/${formData.uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Resource');
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyResources);
      }
    },
  });
};
export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await axios.delete<Resource>(
        `${baseUrl}/${topic}/${uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Resource');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyResources);
      }
    },
  });
};
