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
import { Assessment } from './types';
import { getErrorMessage } from './errorMessages';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;
const topic = 'assessment';
export const queryKeyAssessments = 'assessments';

export const useGetAssessments = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await axios.get<Assessment>(`${baseUrl}/assessment`);
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ?? 'An error occurred retrieving Assessments'
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
    //   throw error.response?.data?.msg ?? 'An error occurred retrieving Events';
    // }
  };

  return useQuery(
    [queryKeyAssessments, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetAssessment = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<Assessment>(`${baseUrl}/${topic}/${id}`);
      return response.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ??
        'An error occurred retrieving the Assessment'
      );
    }
  };

  return useQuery([queryKeyAssessments, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostAssessment = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: any) => {
    try {
      const response = await axios.post<Assessment>(`${baseUrl}/${topic}/`);
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Assessment');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAssessments);
      }
    },
  });
};

export const usePutAssessment = () => {
  const queryClient = useQueryClient();
  const putResult = async (formData: any) => {
    try {
      const response = await axios.put<Assessment>(
        `${baseUrl}/${topic}/${formData.uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Assessment');
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAssessments);
      }
    },
  });
};
export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await axios.delete<Assessment>(
        `${baseUrl}/${topic}/${uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Assessment');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAssessments);
      }
    },
  });
};
